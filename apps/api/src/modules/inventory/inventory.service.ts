import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, type PrismaClient } from '@prisma/client';
import type {
  ApiCollectionResponse,
  InventoryBalance,
  StockMovement,
  StockAdjustmentReason,
} from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { emitDomainEvent } from '../../common/events/emit-domain-event';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';
import { ListInventoryQuery } from './dto/list-inventory.query';
import { ListStockMovementsQuery } from './dto/list-stock-movements.query';
import {
  INVENTORY_BALANCE_INCLUDE,
  STOCK_MOVEMENT_INCLUDE,
  toInventoryBalance,
  toStockMovement,
} from './inventory.mapper';

interface CompositeBalanceKey {
  productId: string;
  warehouseId: string;
}

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListInventoryQuery): Promise<ApiCollectionResponse<InventoryBalance>> {
    let lowStockKeys: CompositeBalanceKey[] | undefined;

    if (query.stockStatus === 'low') {
      lowStockKeys = await this.findLowStockKeys(query);
      if (lowStockKeys.length === 0) {
        return {
          data: [],
          meta: { page: query.page, pageSize: query.pageSize, totalItems: 0, totalPages: 1 },
        };
      }
    }

    const where: Prisma.InventoryBalanceWhereInput = {};
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.productId) where.productId = query.productId;

    const productWhere: Prisma.ProductWhereInput = {};
    if (query.categoryId) productWhere.categoryId = query.categoryId;
    if (query.brandId) productWhere.brandId = query.brandId;
    if (query.q) {
      const term = query.q.trim();
      productWhere.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (Object.keys(productWhere).length > 0) {
      where.product = productWhere;
    }
    if (lowStockKeys) {
      where.OR = lowStockKeys.map((key) => ({ productId: key.productId, warehouseId: key.warehouseId }));
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.inventoryBalance.findMany({
        where,
        include: INVENTORY_BALANCE_INCLUDE,
        orderBy: [{ product: { name: 'asc' } }, { warehouse: { name: 'asc' } }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.inventoryBalance.count({ where }),
    ]);

    return {
      data: rows.map(toInventoryBalance),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  /**
   * INVENTORY.md section 86: negative available stock is rejected by default
   * (no override exists yet - no permission or config for it has been
   * approved). The guard is enforced in the same UPDATE as the increment via
   * a WHERE clause, so a concurrent adjustment on the same balance can never
   * read a value that a second transaction has already invalidated
   * (DATABASE.md section 53 / INVENTORY.md section 89) - the row lock taken
   * by the first UPDATE to commit makes the second wait, then re-evaluate the
   * guard against the now-current row.
   */
  async createAdjustment(
    dto: CreateInventoryAdjustmentDto,
    actorUserId: string,
  ): Promise<InventoryBalance> {
    await this.assertProductExists(dto.productId);
    await this.assertWarehouseExists(dto.warehouseId);

    const delta = new Prisma.Decimal(dto.quantityDelta);
    if (delta.isZero()) {
      throw new ValidationError({ quantityDelta: ['Adjustment quantity must not be zero.'] });
    }

    const { before, after } = await this.prisma.$transaction(async (tx) => {
      await this.ensureBalanceRow(tx, dto.productId, dto.warehouseId);
      const before = delta.isNegative() ? await this.fetchBalance(tx, dto.productId, dto.warehouseId) : null;

      const affected = await tx.$executeRaw`
        UPDATE inventory_balances
        SET on_hand_quantity = on_hand_quantity + ${delta.toString()}::numeric, updated_at = now()
        WHERE product_id = ${dto.productId}::uuid AND warehouse_id = ${dto.warehouseId}::uuid
          AND (on_hand_quantity + ${delta.toString()}::numeric - reserved_quantity) >= 0
      `;
      if (affected === 0) {
        throw new ValidationError({
          quantityDelta: ['This adjustment would make available stock negative.'],
        });
      }

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          movementType: delta.isPositive() ? 'adjustment_in' : 'adjustment_out',
          quantityDelta: delta,
          referenceType: 'adjustment',
          notes: this.composeAdjustmentNotes(dto.reason, dto.notes),
          createdBy: actorUserId,
        },
      });

      const after = await this.fetchBalance(tx, dto.productId, dto.warehouseId);
      return { before, after };
    });

    // Emitted only after the transaction above has committed, never from
    // inside it - a listener side effect (a notification write, on a
    // separate connection) must never be observable before the change it
    // describes is actually durable.
    await this.emitIfCrossedIntoLowStock(before, after);

    await this.auditService.record({
      actorUserId,
      action: 'inventory_balance.adjusted',
      entityType: 'inventory_balance',
      entityId: await this.getBalanceId(dto.productId, dto.warehouseId),
      metadata: {
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantityDelta: delta.toString(),
        reason: dto.reason,
      },
    });

    return after;
  }

  /**
   * Moves stock between two warehouses as a paired transfer_out/transfer_in
   * movement. The source debit uses the same guarded UPDATE as adjustments;
   * the destination credit is a plain increment, which can never be negative.
   */
  async createTransfer(
    dto: CreateInventoryTransferDto,
    actorUserId: string,
  ): Promise<{ from: InventoryBalance; to: InventoryBalance }> {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new ValidationError({ toWarehouseId: ['Transfer destination must differ from source.'] });
    }
    await this.assertProductExists(dto.productId);
    await this.assertWarehouseExists(dto.fromWarehouseId);
    await this.assertWarehouseExists(dto.toWarehouseId);

    const quantity = new Prisma.Decimal(dto.quantity);
    if (!quantity.isPositive()) {
      throw new ValidationError({ quantity: ['Transfer quantity must be greater than zero.'] });
    }

    const { fromBefore, from, to } = await this.prisma.$transaction(async (tx) => {
      await this.ensureBalanceRow(tx, dto.productId, dto.fromWarehouseId);
      await this.ensureBalanceRow(tx, dto.productId, dto.toWarehouseId);
      const fromBefore = await this.fetchBalance(tx, dto.productId, dto.fromWarehouseId);

      const debited = await tx.$executeRaw`
        UPDATE inventory_balances
        SET on_hand_quantity = on_hand_quantity - ${quantity.toString()}::numeric, updated_at = now()
        WHERE product_id = ${dto.productId}::uuid AND warehouse_id = ${dto.fromWarehouseId}::uuid
          AND (on_hand_quantity - ${quantity.toString()}::numeric - reserved_quantity) >= 0
      `;
      if (debited === 0) {
        throw new ValidationError({
          quantity: ['The source warehouse does not have enough available stock for this transfer.'],
        });
      }

      await tx.$executeRaw`
        UPDATE inventory_balances
        SET on_hand_quantity = on_hand_quantity + ${quantity.toString()}::numeric, updated_at = now()
        WHERE product_id = ${dto.productId}::uuid AND warehouse_id = ${dto.toWarehouseId}::uuid
      `;

      const referenceId = randomUUID();
      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.fromWarehouseId,
          movementType: 'transfer_out',
          quantityDelta: quantity.negated(),
          referenceType: 'transfer',
          referenceId,
          notes: dto.notes,
          createdBy: actorUserId,
        },
      });
      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.toWarehouseId,
          movementType: 'transfer_in',
          quantityDelta: quantity,
          referenceType: 'transfer',
          referenceId,
          notes: dto.notes,
          createdBy: actorUserId,
        },
      });

      const [from, to] = await Promise.all([
        this.fetchBalance(tx, dto.productId, dto.fromWarehouseId),
        this.fetchBalance(tx, dto.productId, dto.toWarehouseId),
      ]);
      return { fromBefore, from, to };
    });

    await this.emitIfCrossedIntoLowStock(fromBefore, from);

    await this.auditService.record({
      actorUserId,
      action: 'inventory_balance.transferred',
      entityType: 'inventory_balance',
      entityId: await this.getBalanceId(dto.productId, dto.fromWarehouseId),
      metadata: {
        productId: dto.productId,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        quantity: quantity.toString(),
      },
    });

    return { from, to };
  }

  /**
   * Credits stock as a side effect of a Goods Receipt (PURCHASE.md section
   * 56: "Inventory owns physical receipt"). Called from inside the Goods
   * Receipt module's own transaction, not a transaction this service owns,
   * so PO state and stock update atomically together. A plain increment,
   * never negative-guarded - receiving can only add stock.
   */
  async receiveStock(
    tx: Prisma.TransactionClient,
    params: {
      productId: string;
      warehouseId: string;
      quantity: Prisma.Decimal;
      unitCost?: Prisma.Decimal;
      referenceId: string;
      notes?: string;
      actorUserId: string;
    },
  ): Promise<void> {
    await tx.inventoryBalance.upsert({
      where: { productId_warehouseId: { productId: params.productId, warehouseId: params.warehouseId } },
      create: { id: randomUUID(), productId: params.productId, warehouseId: params.warehouseId },
      update: {},
    });

    await tx.$executeRaw`
      UPDATE inventory_balances
      SET on_hand_quantity = on_hand_quantity + ${params.quantity.toString()}::numeric, updated_at = now()
      WHERE product_id = ${params.productId}::uuid AND warehouse_id = ${params.warehouseId}::uuid
    `;

    await tx.stockMovement.create({
      data: {
        productId: params.productId,
        warehouseId: params.warehouseId,
        movementType: 'purchase_receipt',
        quantityDelta: params.quantity,
        unitCost: params.unitCost,
        referenceType: 'goods_receipt',
        referenceId: params.referenceId,
        notes: params.notes,
        createdBy: params.actorUserId,
      },
    });
  }

  private async ensureBalanceRow(
    tx: TransactionClient,
    productId: string,
    warehouseId: string,
  ): Promise<void> {
    await tx.inventoryBalance.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      create: { id: randomUUID(), productId, warehouseId },
      update: {},
    });
  }

  /** The API's InventoryBalance shape is keyed by (productId, warehouseId), not a single id - audit records still need the row's real id to be filterable by entityId. */
  private async getBalanceId(productId: string, warehouseId: string): Promise<string> {
    const balance = await this.prisma.inventoryBalance.findUniqueOrThrow({
      where: { productId_warehouseId: { productId, warehouseId } },
      select: { id: true },
    });
    return balance.id;
  }

  private async fetchBalance(
    tx: TransactionClient,
    productId: string,
    warehouseId: string,
  ): Promise<InventoryBalance> {
    const balance = await tx.inventoryBalance.findUniqueOrThrow({
      where: { productId_warehouseId: { productId, warehouseId } },
      include: INVENTORY_BALANCE_INCLUDE,
    });
    return toInventoryBalance(balance);
  }

  /**
   * Fires only on the false -> true transition, not on every movement that
   * merely keeps a balance low (PROJECT.md section 26: "Users should not be
   * overwhelmed with unnecessary notifications"). `before` is `null` when the
   * caller already knows the movement could only increase stock.
   */
  private async emitIfCrossedIntoLowStock(before: InventoryBalance | null, after: InventoryBalance): Promise<void> {
    if (before && !before.isLowStock && after.isLowStock) {
      await emitDomainEvent(this.events, DOMAIN_EVENTS.lowStock, {
        productId: after.productId,
        productName: after.product.name,
        warehouseId: after.warehouseId,
        warehouseName: after.warehouse.name,
      });
    }
  }

  private composeAdjustmentNotes(reason: StockAdjustmentReason, notes?: string): string {
    const label = reason.replace(/_/g, ' ');
    return notes ? `${label}: ${notes}` : label;
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError('Product not found.');
    }
  }

  private async assertWarehouseExists(warehouseId: string): Promise<void> {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found.');
    }
  }

  async getProductInventory(productId: string): Promise<{ data: InventoryBalance[] }> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    const balances = await this.prisma.inventoryBalance.findMany({
      where: { productId },
      include: INVENTORY_BALANCE_INCLUDE,
      orderBy: { warehouse: { name: 'asc' } },
    });
    return { data: balances.map(toInventoryBalance) };
  }

  async listMovements(query: ListStockMovementsQuery): Promise<ApiCollectionResponse<StockMovement>> {
    const where: Prisma.StockMovementWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.movementType) where.movementType = query.movementType;
    if (query.dateFrom || query.dateTo) {
      where.movementAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: STOCK_MOVEMENT_INCLUDE,
        orderBy: { movementAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: rows.map(toStockMovement),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  /**
   * Low stock (available <= minimumStockLevel) compares two columns, which
   * Prisma's query builder cannot express - resolved with a parameterised raw
   * query, then re-fetched through the normal mapper path for shape/pagination
   * consistency with the rest of `list()`.
   */
  private async findLowStockKeys(query: ListInventoryQuery): Promise<CompositeBalanceKey[]> {
    const term = query.q?.trim();
    return this.prisma.$queryRaw<CompositeBalanceKey[]>`
      SELECT ib.product_id AS "productId", ib.warehouse_id AS "warehouseId"
      FROM inventory_balances ib
      INNER JOIN products p ON p.id = ib.product_id
      WHERE p.minimum_stock_level IS NOT NULL
        AND (ib.on_hand_quantity - ib.reserved_quantity) <= p.minimum_stock_level
        ${query.warehouseId ? Prisma.sql`AND ib.warehouse_id = ${query.warehouseId}::uuid` : Prisma.empty}
        ${query.productId ? Prisma.sql`AND ib.product_id = ${query.productId}::uuid` : Prisma.empty}
        ${query.categoryId ? Prisma.sql`AND p.category_id = ${query.categoryId}::uuid` : Prisma.empty}
        ${query.brandId ? Prisma.sql`AND p.brand_id = ${query.brandId}::uuid` : Prisma.empty}
        ${term ? Prisma.sql`AND (p.name ILIKE ${'%' + term + '%'} OR p.sku ILIKE ${'%' + term + '%'})` : Prisma.empty}
    `;
  }
}
