import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Communication, Quotation, QuotationSummary, SalesOrder } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { emitDomainEvent } from '../../common/events/emit-domain-event';
import { BusinessRuleError, ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import {
  calculateDocumentTotals,
  resolveCustomLine,
  resolveLine,
  type ProductForLineResolution,
} from '../../common/commercial/quotation-line-calculator';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { resolveTeamMemberUserIds } from '../../common/teams/team-scope';
import { PrismaService } from '../../database/prisma.service';
import { CommunicationsService } from '../communications/communications.service';
import { SALES_ORDER_DETAIL_INCLUDE, toSalesOrder } from '../sales-orders/sales-order.mapper';
import { CancelQuotationDto } from './dto/cancel-quotation.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { ListQuotationsQuery } from './dto/list-quotations.query';
import { QuotationItemDto } from './dto/quotation-item.dto';
import { ShareQuotationDto } from './dto/share-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import {
  QUOTATION_DETAIL_INCLUDE,
  QUOTATION_SUMMARY_INCLUDE,
  toQuotation,
  toQuotationSummary,
  type QuotationWithDetailRelations,
} from './quotation.mapper';

const PRODUCT_LINE_INCLUDE = { unit: { select: { symbol: true } } } as const;

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly auditService: AuditService,
    private readonly events: EventEmitter2,
    private readonly communicationsService: CommunicationsService,
  ) {}

  async list(query: ListQuotationsQuery): Promise<ApiCollectionResponse<QuotationSummary>> {
    const where: Prisma.QuotationWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerCompanyId) where.customerCompanyId = query.customerCompanyId;
    if (query.q) where.quotationNumber = { contains: query.q.trim(), mode: 'insensitive' };
    if (query.teamId) {
      where.ownerId = { in: await resolveTeamMemberUserIds(this.prisma, query.teamId) };
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        include: QUOTATION_SUMMARY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return {
      data: rows.map(toQuotationSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Quotation> {
    const quotation = await this.getDetailOrThrow(id);
    return toQuotation(quotation);
  }

  async create(dto: CreateQuotationDto, actorUserId: string): Promise<Quotation> {
    await this.assertCompanyExists(dto.customerCompanyId);
    if (dto.contactId) await this.assertContactExists(dto.contactId);
    if (dto.leadId) await this.assertLeadExists(dto.leadId);

    const lines = await this.resolveItems(dto.items);
    const totals = calculateDocumentTotals(lines);

    const quotation = await this.prisma.$transaction(async (tx) => {
      const quotationNumber = await this.numbering.next(tx, 'quotation', 'QT');

      const created = await tx.quotation.create({
        data: {
          quotationNumber,
          customerCompanyId: dto.customerCompanyId,
          contactId: dto.contactId,
          leadId: dto.leadId,
          quotationDate: new Date(dto.quotationDate),
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          notes: dto.notes,
          terms: dto.terms,
          ownerId: actorUserId,
          createdBy: actorUserId,
          items: {
            create: lines.map((line, index) => ({ ...line, sortOrder: index })),
          },
        },
        include: QUOTATION_DETAIL_INCLUDE,
      });

      return created;
    });

    await this.auditService.record({
      actorUserId,
      action: 'quotation.created',
      entityType: 'quotation',
      entityId: quotation.id,
      afterData: { quotationNumber: quotation.quotationNumber, totalAmount: quotation.totalAmount.toString() },
    });

    return toQuotation(quotation);
  }

  async update(id: string, dto: UpdateQuotationDto, actorUserId: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    if (existing.status !== 'draft') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a draft quotation can be edited.');
    }

    if (dto.customerCompanyId) await this.assertCompanyExists(dto.customerCompanyId);
    if (dto.contactId) await this.assertContactExists(dto.contactId);
    if (dto.leadId) await this.assertLeadExists(dto.leadId);

    const lines = dto.items ? await this.resolveItems(dto.items) : undefined;
    const totals = lines ? calculateDocumentTotals(lines) : undefined;

    const quotation = await this.prisma.$transaction(async (tx) => {
      if (lines) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          customerCompanyId: dto.customerCompanyId,
          contactId: dto.contactId,
          leadId: dto.leadId,
          quotationDate: dto.quotationDate ? new Date(dto.quotationDate) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
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
        include: QUOTATION_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'quotation.updated',
      entityType: 'quotation',
      entityId: id,
      beforeData: { totalAmount: existing.totalAmount.toString() },
      afterData: { totalAmount: quotation.totalAmount.toString() },
    });

    return toQuotation(quotation);
  }

  /** SALES.md sections 34-35: a discount always requires approval - no configurable threshold exists yet. */
  async submit(id: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['draft'], 'submitted for approval');

    const nextStatus = existing.discountAmount.greaterThan(0) ? 'approval_pending' : 'approved';
    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: nextStatus },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    if (nextStatus === 'approval_pending') {
      await emitDomainEvent(this.events, DOMAIN_EVENTS.quotationApprovalRequired, {
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
      });
    }
    return toQuotation(quotation);
  }

  async approve(id: string, actorUserId: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approval_pending'], 'approved');

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'approved' },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'quotation.approved',
      entityType: 'quotation',
      entityId: id,
      metadata: { totalAmount: existing.totalAmount.toString(), discountAmount: existing.discountAmount.toString() },
    });
    return toQuotation(quotation);
  }

  async rejectApproval(id: string, actorUserId: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approval_pending'], 'sent back to draft');

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'draft' },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'quotation.approval_rejected',
      entityType: 'quotation',
      entityId: id,
    });
    return toQuotation(quotation);
  }

  async send(id: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['approved'], 'sent');

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'sent' },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    return toQuotation(quotation);
  }

  /**
   * MOBILE_PRD.md section 7.6 "Share Quotation" - a text summary sent via
   * the existing Communications module (Twilio WhatsApp / SendGrid Email),
   * logged against this quotation like any other message. No PDF - see
   * ShareQuotationRequest in packages/types/src/sales.ts for why.
   */
  async share(id: string, dto: ShareQuotationDto, actorUserId: string): Promise<Communication> {
    const quotation = await this.getDetailOrThrow(id);

    const [company, contact] = await Promise.all([
      this.prisma.company.findUnique({
        where: { id: quotation.customerCompanyId },
        select: { phone: true, email: true },
      }),
      quotation.contactId
        ? this.prisma.contact.findUnique({ where: { id: quotation.contactId }, select: { phone: true, email: true } })
        : Promise.resolve(null),
    ]);

    const recipient = dto.recipient ?? resolveShareRecipient(dto.channel, contact, company);
    if (!recipient) {
      throw new ValidationError({
        recipient: [
          `No ${dto.channel === 'whatsapp' ? 'phone number' : 'email address'} is on file for this customer. Provide a recipient.`,
        ],
      });
    }

    return this.communicationsService.create(
      {
        channel: dto.channel,
        recipient,
        subject: dto.channel === 'email' ? `Quotation ${quotation.quotationNumber}` : undefined,
        messageBody: buildQuotationShareMessage(quotation),
        relatedEntityType: 'quotation',
        relatedEntityId: id,
      },
      actorUserId,
    );
  }

  async accept(id: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['sent', 'negotiation'], 'accepted');

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'accepted' },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    await emitDomainEvent(this.events, DOMAIN_EVENTS.quotationDecided, {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      decision: 'accepted',
      ownerId: quotation.ownerId,
    });
    return toQuotation(quotation);
  }

  async reject(id: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['sent', 'negotiation'], 'rejected');

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'rejected' },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    await emitDomainEvent(this.events, DOMAIN_EVENTS.quotationDecided, {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      decision: 'rejected',
      ownerId: quotation.ownerId,
    });
    return toQuotation(quotation);
  }

  async cancel(id: string, dto: CancelQuotationDto, actorUserId: string): Promise<Quotation> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(
      existing.status,
      ['draft', 'approval_pending', 'approved', 'sent', 'negotiation'],
      'cancelled',
    );

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'cancelled', notes: appendNote(existing.notes, `Cancelled: ${dto.reason}`) },
      include: QUOTATION_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'quotation.cancelled',
      entityType: 'quotation',
      entityId: id,
      metadata: { reason: dto.reason },
    });
    return toQuotation(quotation);
  }

  /**
   * API.md section 67: converts an accepted quotation into a sales order
   * without requiring the client to recreate every line item, preserving
   * traceability via `SalesOrder.quotationId` / `SalesOrderItem.quotationItemId`.
   * The quotation's own status is left `accepted` - it represents "the
   * customer said yes", not "an order exists", and a quotation can only be
   * converted once (checked below).
   */
  async convertToOrder(id: string, actorUserId: string): Promise<SalesOrder> {
    const quotation = await this.getDetailOrThrow(id);
    this.assertStatus(quotation.status, ['accepted'], 'converted to a sales order');

    const existingOrder = await this.prisma.salesOrder.findFirst({
      where: { quotationId: id, status: { not: 'cancelled' } },
    });
    if (existingOrder) {
      throw new ConflictError('This quotation has already been converted to a sales order.');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const salesOrderNumber = await this.numbering.next(tx, 'sales_order', 'SO');

      return tx.salesOrder.create({
        data: {
          salesOrderNumber,
          quotationId: quotation.id,
          customerCompanyId: quotation.customerCompanyId,
          contactId: quotation.contactId,
          orderDate: new Date(),
          subtotal: quotation.subtotal,
          discountAmount: quotation.discountAmount,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          notes: quotation.notes,
          terms: quotation.terms,
          ownerId: quotation.ownerId,
          createdBy: actorUserId,
          items: {
            create: quotation.items.map((item, index) => ({
              productId: item.productId,
              quotationItemId: item.id,
              skuSnapshot: item.skuSnapshot,
              productNameSnapshot: item.productNameSnapshot,
              descriptionSnapshot: item.descriptionSnapshot,
              hsnSnapshot: item.hsnSnapshot,
              unitSnapshot: item.unitSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercentage: item.discountPercentage,
              discountAmount: item.discountAmount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              lineTotal: item.lineTotal,
              sortOrder: index,
            })),
          },
        },
        include: SALES_ORDER_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'quotation.converted_to_order',
      entityType: 'quotation',
      entityId: id,
      metadata: { salesOrderId: order.id, salesOrderNumber: order.salesOrderNumber },
    });

    return toSalesOrder(order);
  }

  private async getDetailOrThrow(id: string): Promise<QuotationWithDetailRelations> {
    const quotation = await this.prisma.quotation.findUnique({ where: { id }, include: QUOTATION_DETAIL_INCLUDE });
    if (!quotation) {
      throw new NotFoundError('Quotation not found.');
    }
    return quotation;
  }

  private assertStatus(current: string, allowed: string[], action: string): void {
    if (!allowed.includes(current)) {
      throw new BusinessRuleError(
        'INVALID_STATE_TRANSITION',
        `A quotation in "${current}" status cannot be ${action}.`,
      );
    }
  }

  /**
   * Each item is either a real catalog product (`productId`) or an ad-hoc
   * line with no catalog product (`customProductName` - mobile Field Sales
   * Executive scope, SALES.md). Exactly one of the two must be set, and an
   * ad-hoc line needs an explicit `unitPrice` since there is no product to
   * default one from.
   */
  private async resolveItems(items: QuotationItemDto[]) {
    for (const item of items) {
      if (Boolean(item.productId) === Boolean(item.customProductName)) {
        throw new ValidationError({
          productId: ['Provide either productId or customProductName, not both.'],
        });
      }
      if (item.customProductName && !item.unitPrice) {
        throw new ValidationError({
          unitPrice: ['unitPrice is required for a custom (non-catalog) item.'],
        });
      }
    }

    const productIds = [...new Set(items.flatMap((item) => (item.productId ? [item.productId] : [])))];
    const products = productIds.length
      ? await this.prisma.product.findMany({ where: { id: { in: productIds } }, include: PRODUCT_LINE_INCLUDE })
      : [];
    const byId = new Map(products.map((product) => [product.id, product as ProductForLineResolution]));

    return items.map((item) => {
      if (item.customProductName) {
        return resolveCustomLine({
          customProductName: item.customProductName,
          quantity: item.quantity,
          unitPrice: item.unitPrice!,
          discountPercentage: item.discountPercentage,
        });
      }
      const product = byId.get(item.productId!);
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found.`);
      }
      return resolveLine(product, { ...item, productId: item.productId! });
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

  private async assertLeadExists(id: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundError('Lead not found.');
    }
  }

}

function appendNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}

function resolveShareRecipient(
  channel: 'whatsapp' | 'email',
  contact: { phone: string | null; email: string | null } | null,
  company: { phone: string | null; email: string | null } | null,
): string | null {
  const field = channel === 'whatsapp' ? 'phone' : 'email';
  return contact?.[field] ?? company?.[field] ?? null;
}

function buildQuotationShareMessage(quotation: QuotationWithDetailRelations): string {
  const lines = quotation.items
    .map(
      (item) =>
        `- ${item.productNameSnapshot} x ${item.quantity.toString()} @ ${item.unitPrice.toString()} = ${item.lineTotal.toString()}`,
    )
    .join('\n');

  return [
    `Quotation ${quotation.quotationNumber} for ${quotation.customer.name}`,
    lines,
    `Total: ${quotation.currencyCode} ${quotation.totalAmount.toString()}`,
  ].join('\n\n');
}
