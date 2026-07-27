import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, GoodsReceipt } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { BusinessRuleError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptsQuery } from './dto/list-goods-receipts.query';
import { GOODS_RECEIPT_INCLUDE, toGoodsReceipt } from './goods-receipt.mapper';

const RECEIVABLE_PO_STATUSES = ['sent', 'supplier_confirmed', 'partially_received'];

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly inventoryService: InventoryService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListGoodsReceiptsQuery): Promise<ApiCollectionResponse<GoodsReceipt>> {
    const where: Prisma.GoodsReceiptWhereInput = {};
    if (query.purchaseOrderId) where.purchaseOrderId = query.purchaseOrderId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;

    const [rows, totalItems] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where,
        include: GOODS_RECEIPT_INCLUDE,
        orderBy: { receiptDate: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);

    return {
      data: rows.map(toGoodsReceipt),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<GoodsReceipt> {
    const receipt = await this.prisma.goodsReceipt.findUnique({ where: { id }, include: GOODS_RECEIPT_INCLUDE });
    if (!receipt) {
      throw new NotFoundError('Goods receipt not found.');
    }
    return toGoodsReceipt(receipt);
  }

  /**
   * API.md section 74's transaction sequence: validate PO/remaining quantity
   * -> create receipt -> create receipt items -> create stock movements
   * (via InventoryService, "Inventory owns physical receipt" - PURCHASE.md
   * section 56) -> update PO received quantities -> recalculate PO state ->
   * audit. Only the accepted portion of each line credits stock; rejected
   * quantity still counts as "received" for pending-quantity tracking (the
   * supplier did deliver it) but never reaches the warehouse.
   */
  async create(dto: CreateGoodsReceiptDto, actorUserId: string): Promise<GoodsReceipt> {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.purchaseOrderId },
      include: { items: true },
    });
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase order not found.');
    }
    if (!RECEIVABLE_PO_STATUSES.includes(purchaseOrder.status)) {
      throw new BusinessRuleError(
        'INVALID_STATE_TRANSITION',
        `A purchase order in "${purchaseOrder.status}" status cannot receive goods.`,
      );
    }

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found.');
    }

    const poItemsById = new Map(purchaseOrder.items.map((item) => [item.id, item]));
    const resolvedItems = dto.items.map((itemDto) => {
      const poItem = poItemsById.get(itemDto.purchaseOrderItemId);
      if (!poItem) {
        throw new NotFoundError(
          `Purchase order item ${itemDto.purchaseOrderItemId} not found on this purchase order.`,
        );
      }

      const quantityReceived = new Prisma.Decimal(itemDto.quantityReceived);
      if (!quantityReceived.isPositive()) {
        throw new ValidationError({ quantityReceived: ['Quantity received must be greater than zero.'] });
      }

      const rejectedQuantity = new Prisma.Decimal(itemDto.rejectedQuantity ?? 0);
      if (rejectedQuantity.isNegative() || rejectedQuantity.greaterThan(quantityReceived)) {
        throw new ValidationError({
          rejectedQuantity: ['Rejected quantity cannot be negative or exceed the quantity received.'],
        });
      }

      const pending = poItem.orderedQuantity.minus(poItem.receivedQuantity);
      if (quantityReceived.greaterThan(pending)) {
        throw new ValidationError({
          quantityReceived: [
            `Cannot receive more than the pending quantity (${pending.toString()}) for ${poItem.skuSnapshot}.`,
          ],
        });
      }

      return {
        poItem,
        quantityReceived,
        rejectedQuantity,
        acceptedQuantity: quantityReceived.minus(rejectedQuantity),
        notes: itemDto.notes,
      };
    });

    const receipt = await this.prisma.$transaction(async (tx) => {
      const receiptNumber = await this.numbering.next(tx, 'goods_receipt', 'GRN');

      const created = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: dto.purchaseOrderId,
          warehouseId: dto.warehouseId,
          receiptDate: new Date(dto.receiptDate),
          supplierDocumentNumber: dto.supplierDocumentNumber,
          notes: dto.notes,
          receivedBy: actorUserId,
          items: {
            create: resolvedItems.map((item) => ({
              purchaseOrderItemId: item.poItem.id,
              productId: item.poItem.productId,
              quantityReceived: item.quantityReceived,
              acceptedQuantity: item.acceptedQuantity,
              rejectedQuantity: item.rejectedQuantity,
              unitCost: item.poItem.unitPrice,
              notes: item.notes,
            })),
          },
        },
        include: GOODS_RECEIPT_INCLUDE,
      });

      for (const item of resolvedItems) {
        if (item.acceptedQuantity.isPositive()) {
          await this.inventoryService.receiveStock(tx, {
            productId: item.poItem.productId,
            warehouseId: dto.warehouseId,
            quantity: item.acceptedQuantity,
            unitCost: item.poItem.unitPrice,
            referenceId: created.id,
            notes: `GRN ${receiptNumber}`,
            actorUserId,
          });
        }

        await tx.purchaseOrderItem.update({
          where: { id: item.poItem.id },
          data: { receivedQuantity: { increment: item.quantityReceived } },
        });
      }

      const updatedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: dto.purchaseOrderId } });
      const allReceived = updatedItems.every((item) => item.receivedQuantity.greaterThanOrEqualTo(item.orderedQuantity));
      const anyReceived = updatedItems.some((item) => item.receivedQuantity.isPositive());
      const nextStatus = allReceived ? 'received' : anyReceived ? 'partially_received' : purchaseOrder.status;

      if (nextStatus !== purchaseOrder.status) {
        await tx.purchaseOrder.update({ where: { id: dto.purchaseOrderId }, data: { status: nextStatus } });
      }

      return created;
    });

    await this.auditService.record({
      actorUserId,
      action: 'goods_receipt.created',
      entityType: 'goods_receipt',
      entityId: receipt.id,
      metadata: { purchaseOrderId: dto.purchaseOrderId, warehouseId: dto.warehouseId },
    });

    return toGoodsReceipt(receipt);
  }
}
