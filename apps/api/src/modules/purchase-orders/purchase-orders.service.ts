import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, PurchaseOrder, PurchaseOrderSummary } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { calculateDocumentTotals } from '../../common/commercial/quotation-line-calculator';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { emitDomainEvent } from '../../common/events/emit-domain-event';
import { BusinessRuleError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ListPurchaseOrdersQuery } from './dto/list-purchase-orders.query';
import { PurchaseOrderItemDto } from './dto/purchase-order-item.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import {
  PURCHASE_ORDER_DETAIL_INCLUDE,
  PURCHASE_ORDER_SUMMARY_INCLUDE,
  toPurchaseOrder,
  toPurchaseOrderSummary,
  type PurchaseOrderWithDetailRelations,
} from './purchase-order.mapper';
import {
  resolvePurchaseLine,
  type ProductForPurchaseLineResolution,
} from './purchase-order-line-calculator';

const PRODUCT_LINE_INCLUDE = { unit: { select: { symbol: true } } } as const;

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly auditService: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async list(query: ListPurchaseOrdersQuery): Promise<ApiCollectionResponse<PurchaseOrderSummary>> {
    const where: Prisma.PurchaseOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.supplierCompanyId) where.supplierCompanyId = query.supplierCompanyId;
    if (query.q) where.poNumber = { contains: query.q.trim(), mode: 'insensitive' };

    const [rows, totalItems] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: PURCHASE_ORDER_SUMMARY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: rows.map(toPurchaseOrderSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<PurchaseOrder> {
    return toPurchaseOrder(await this.getDetailOrThrow(id));
  }

  async create(dto: CreatePurchaseOrderDto, actorUserId: string): Promise<PurchaseOrder> {
    await this.assertIsSupplier(dto.supplierCompanyId);

    const lines = await this.resolveItems(dto.items);
    const totals = calculateDocumentTotals(
      lines.map((line) => ({
        quantity: line.orderedQuantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount,
        taxAmount: line.taxAmount,
      })),
    );

    const order = await this.prisma.$transaction(async (tx) => {
      const poNumber = await this.numbering.next(tx, 'purchase_order', 'PO');

      return tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierCompanyId: dto.supplierCompanyId,
          poDate: new Date(dto.poDate),
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          notes: dto.notes,
          terms: dto.terms,
          createdBy: actorUserId,
          items: { create: lines.map((line, index) => ({ ...line, sortOrder: index })) },
        },
        include: PURCHASE_ORDER_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.created',
      entityType: 'purchase_order',
      entityId: order.id,
      afterData: { poNumber: order.poNumber, totalAmount: order.totalAmount.toString() },
    });

    return toPurchaseOrder(order);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, actorUserId: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    if (existing.status !== 'draft') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a draft purchase order can be edited.');
    }

    if (dto.supplierCompanyId) await this.assertIsSupplier(dto.supplierCompanyId);

    const lines = dto.items ? await this.resolveItems(dto.items) : undefined;
    const totals = lines
      ? calculateDocumentTotals(
          lines.map((line) => ({
            quantity: line.orderedQuantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            taxAmount: line.taxAmount,
          })),
        )
      : undefined;

    const order = await this.prisma.$transaction(async (tx) => {
      if (lines) {
        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierCompanyId: dto.supplierCompanyId,
          poDate: dto.poDate ? new Date(dto.poDate) : undefined,
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
        include: PURCHASE_ORDER_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.updated',
      entityType: 'purchase_order',
      entityId: id,
      beforeData: { totalAmount: existing.totalAmount.toString() },
      afterData: { totalAmount: order.totalAmount.toString() },
    });

    return toPurchaseOrder(order);
  }

  /** PURCHASE.md section 38: a PO represents "an approved commercial commitment" - every PO requires approval, unlike Quotations' discount-conditional gate. */
  async submit(id: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['draft'], 'submitted for approval');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'approval_pending' },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    await emitDomainEvent(this.events, DOMAIN_EVENTS.purchaseOrderApprovalRequired, {
      purchaseOrderId: order.id,
      purchaseOrderNumber: order.poNumber,
    });
    return toPurchaseOrder(order);
  }

  async approve(id: string, actorUserId: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approval_pending'], 'approved');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'approved', approvedBy: actorUserId, approvedAt: new Date() },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.approved',
      entityType: 'purchase_order',
      entityId: id,
      metadata: { totalAmount: existing.totalAmount.toString() },
    });
    return toPurchaseOrder(order);
  }

  async rejectApproval(id: string, actorUserId: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approval_pending'], 'sent back to draft');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'draft' },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.approval_rejected',
      entityType: 'purchase_order',
      entityId: id,
    });
    return toPurchaseOrder(order);
  }

  async send(id: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approved'], 'sent');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'sent' },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    return toPurchaseOrder(order);
  }

  async markSupplierConfirmed(id: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['sent'], 'marked supplier-confirmed');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'supplier_confirmed' },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    return toPurchaseOrder(order);
  }

  /** PURCHASE.md section 60: intentionally stop waiting for the remaining pending quantity. */
  async close(id: string, actorUserId: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['partially_received'], 'closed');

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'closed' },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.closed',
      entityType: 'purchase_order',
      entityId: id,
    });
    return toPurchaseOrder(order);
  }

  async cancel(id: string, dto: CancelPurchaseOrderDto, actorUserId: string): Promise<PurchaseOrder> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(
      existing.status,
      ['draft', 'approval_pending', 'approved', 'sent', 'supplier_confirmed'],
      'cancelled',
    );

    const order = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'cancelled', notes: appendNote(existing.notes, `Cancelled: ${dto.reason}`) },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'purchase_order.cancelled',
      entityType: 'purchase_order',
      entityId: id,
      metadata: { reason: dto.reason },
    });
    return toPurchaseOrder(order);
  }

  async getDetailOrThrow(id: string): Promise<PurchaseOrderWithDetailRelations> {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: PURCHASE_ORDER_DETAIL_INCLUDE,
    });
    if (!order) {
      throw new NotFoundError('Purchase order not found.');
    }
    return order;
  }

  private assertStatus(current: string, allowed: string[], action: string): void {
    if (!allowed.includes(current)) {
      throw new BusinessRuleError(
        'INVALID_STATE_TRANSITION',
        `A purchase order in "${current}" status cannot be ${action}.`,
      );
    }
  }

  private async resolveItems(items: PurchaseOrderItemDto[]) {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: PRODUCT_LINE_INCLUDE,
    });
    const byId = new Map(products.map((product) => [product.id, product as ProductForPurchaseLineResolution]));

    return items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found.`);
      }
      return resolvePurchaseLine(product, item);
    });
  }

  private async assertIsSupplier(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Supplier company not found.');
    }
    if (!company.isSupplier) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This company is not marked as a supplier.');
    }
  }
}

function appendNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}
