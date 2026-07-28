import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  ApiCollectionResponse,
  ConfirmSalesOrderResponse,
  SalesOrder,
  SalesOrderStockWarning,
  SalesOrderSummary,
} from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import {
  calculateDocumentTotals,
  resolveLine,
  type ProductForLineResolution,
} from '../../common/commercial/quotation-line-calculator';
import { BusinessRuleError, NotFoundError } from '../../common/errors/app-error';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { resolveTeamMemberUserIds } from '../../common/teams/team-scope';
import { PrismaService } from '../../database/prisma.service';
import { CancelSalesOrderDto } from './dto/cancel-sales-order.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ListSalesOrdersQuery } from './dto/list-sales-orders.query';
import { SalesOrderItemDto } from './dto/sales-order-item.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import {
  SALES_ORDER_DETAIL_INCLUDE,
  SALES_ORDER_SUMMARY_INCLUDE,
  toSalesOrder,
  toSalesOrderSummary,
  type SalesOrderWithDetailRelations,
} from './sales-order.mapper';

const PRODUCT_LINE_INCLUDE = { unit: { select: { symbol: true } } } as const;

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListSalesOrdersQuery): Promise<ApiCollectionResponse<SalesOrderSummary>> {
    const where: Prisma.SalesOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerCompanyId) where.customerCompanyId = query.customerCompanyId;
    if (query.q) where.salesOrderNumber = { contains: query.q.trim(), mode: 'insensitive' };
    if (query.teamId) {
      where.ownerId = { in: await resolveTeamMemberUserIds(this.prisma, query.teamId) };
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: SALES_ORDER_SUMMARY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data: rows.map(toSalesOrderSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<SalesOrder> {
    return toSalesOrder(await this.getDetailOrThrow(id));
  }

  async create(dto: CreateSalesOrderDto, actorUserId: string): Promise<SalesOrder> {
    await this.assertCompanyExists(dto.customerCompanyId);
    if (dto.contactId) await this.assertContactExists(dto.contactId);

    const lines = await this.resolveItems(dto.items);
    const totals = calculateDocumentTotals(lines);

    const order = await this.prisma.$transaction(async (tx) => {
      const salesOrderNumber = await this.numbering.next(tx, 'sales_order', 'SO');

      return tx.salesOrder.create({
        data: {
          salesOrderNumber,
          customerCompanyId: dto.customerCompanyId,
          contactId: dto.contactId,
          orderDate: new Date(dto.orderDate),
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          notes: dto.notes,
          terms: dto.terms,
          ownerId: actorUserId,
          createdBy: actorUserId,
          items: { create: lines.map((line, index) => ({ ...line, sortOrder: index })) },
        },
        include: SALES_ORDER_DETAIL_INCLUDE,
      });
    });

    return toSalesOrder(order);
  }

  async update(id: string, dto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const existing = await this.getDetailOrThrow(id);
    if (existing.status !== 'draft') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a draft sales order can be edited.');
    }

    if (dto.customerCompanyId) await this.assertCompanyExists(dto.customerCompanyId);
    if (dto.contactId) await this.assertContactExists(dto.contactId);

    const lines = dto.items ? await this.resolveItems(dto.items) : undefined;
    const totals = lines ? calculateDocumentTotals(lines) : undefined;

    const order = await this.prisma.$transaction(async (tx) => {
      if (lines) {
        await tx.salesOrderItem.deleteMany({ where: { salesOrderId: id } });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          customerCompanyId: dto.customerCompanyId,
          contactId: dto.contactId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
          notes: dto.notes,
          terms: dto.terms,
          ...(totals && lines
            ? {
                subtotal: totals.subtotal,
                discountAmount: totals.discountAmount,
                taxAmount: totals.taxAmount,
                totalAmount: totals.totalAmount,
                items: { create: lines.map((line, index) => ({ ...line, sortOrder: index })) },
              }
            : {}),
        },
        include: SALES_ORDER_DETAIL_INCLUDE,
      });
    });

    return toSalesOrder(order);
  }

  /**
   * SALES.md sections 53, 55: a stock shortage is a warning, not a blocking
   * error - Inventory remains authoritative and Sales never writes to stock,
   * so this only reads current availability. No warehouse is assigned to an
   * order at this stage, so availability is checked in aggregate across all
   * warehouses (Inventory's Sales Allocation / reservation tier is deferred).
   */
  async confirm(id: string, actorUserId: string): Promise<ConfirmSalesOrderResponse> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['draft', 'confirmation_pending'], 'confirmed');

    const stockWarnings = await this.checkStockAvailability(existing.items);

    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: { status: 'confirmed', confirmedAt: new Date() },
      include: SALES_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'sales_order.confirmed',
      entityType: 'sales_order',
      entityId: id,
      metadata: { stockWarningCount: stockWarnings.length },
    });

    return { salesOrder: toSalesOrder(order), stockWarnings };
  }

  async cancel(id: string, dto: CancelSalesOrderDto, actorUserId: string): Promise<SalesOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(
      existing.status,
      ['draft', 'confirmation_pending', 'confirmed', 'processing'],
      'cancelled',
    );

    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        notes: appendNote(existing.notes, `Cancelled: ${dto.reason}`),
      },
      include: SALES_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'sales_order.cancelled',
      entityType: 'sales_order',
      entityId: id,
      metadata: { reason: dto.reason },
    });
    return toSalesOrder(order);
  }

  /**
   * Manual completion - Inventory's dispatch/fulfilment tier (which would
   * update `fulfilledQuantity` per item from real pick/dispatch records)
   * does not exist yet, so this only marks the order itself fulfilled.
   */
  async complete(id: string, actorUserId: string): Promise<SalesOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['confirmed', 'processing', 'partially_fulfilled'], 'completed');

    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: { status: 'fulfilled', completedAt: new Date() },
      include: SALES_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'sales_order.completed',
      entityType: 'sales_order',
      entityId: id,
    });
    return toSalesOrder(order);
  }

  async getDetailOrThrow(id: string): Promise<SalesOrderWithDetailRelations> {
    const order = await this.prisma.salesOrder.findUnique({ where: { id }, include: SALES_ORDER_DETAIL_INCLUDE });
    if (!order) {
      throw new NotFoundError('Sales order not found.');
    }
    return order;
  }

  private assertStatus(current: string, allowed: string[], action: string): void {
    if (!allowed.includes(current)) {
      throw new BusinessRuleError(
        'INVALID_STATE_TRANSITION',
        `A sales order in "${current}" status cannot be ${action}.`,
      );
    }
  }

  private async checkStockAvailability(
    items: { productId: string; skuSnapshot: string; productNameSnapshot: string; quantity: Prisma.Decimal }[],
  ): Promise<SalesOrderStockWarning[]> {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const balances = await this.prisma.inventoryBalance.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _sum: { onHandQuantity: true, reservedQuantity: true },
    });
    const availableByProduct = new Map(
      balances.map((balance) => [
        balance.productId,
        new Prisma.Decimal(balance._sum.onHandQuantity ?? 0).minus(balance._sum.reservedQuantity ?? 0),
      ]),
    );

    const warnings: SalesOrderStockWarning[] = [];
    for (const item of items) {
      const available = availableByProduct.get(item.productId) ?? new Prisma.Decimal(0);
      if (available.lessThan(item.quantity)) {
        warnings.push({
          productId: item.productId,
          sku: item.skuSnapshot,
          productName: item.productNameSnapshot,
          orderedQuantity: item.quantity.toString(),
          availableQuantity: available.toString(),
        });
      }
    }
    return warnings;
  }

  private async resolveItems(items: SalesOrderItemDto[]) {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: PRODUCT_LINE_INCLUDE,
    });
    const byId = new Map(products.map((product) => [product.id, product as ProductForLineResolution]));

    return items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found.`);
      }
      return resolveLine(product, item);
    });
  }

  private async assertCompanyExists(id: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError('Customer company not found.');
    }
  }

  private async assertContactExists(id: string): Promise<void> {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundError('Contact not found.');
    }
  }
}

function appendNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}
