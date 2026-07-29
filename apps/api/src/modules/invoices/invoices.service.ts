import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  ApiCollectionResponse,
  CreateInvoiceResponse,
  CreditLimitWarning,
  Invoice,
  InvoiceSummary,
  OutstandingInvoice,
} from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import type { ProductForLineResolution } from '../../common/commercial/quotation-line-calculator';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { BusinessRuleError, ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CustomerProfileService } from '../customers/customer-profile.service';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceFromSalesOrderDto } from './dto/create-invoice-from-sales-order.dto';
import { InvoiceItemDto } from './dto/invoice-item.dto';
import { ListInvoicesQuery } from './dto/list-invoices.query';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  calculateInvoiceTotals,
  determineTaxTreatment,
  resolveInvoiceLineFromRequest,
  resolveInvoiceLineFromSalesOrderItem,
  type ResolvedInvoiceLine,
} from './invoice-line-calculator';
import {
  INVOICE_DETAIL_INCLUDE,
  INVOICE_SUMMARY_INCLUDE,
  toInvoice,
  toInvoiceSummary,
  toOutstandingInvoice,
  type InvoiceWithDetailRelations,
} from './invoice.mapper';

const PRODUCT_LINE_INCLUDE = { unit: { select: { symbol: true } } } as const;
const SELLER_STATE_CODE_SETTING_KEY = 'billing.seller_state_code';
/** Invoices may only be raised against a Sales Order that represents a real commercial commitment (SALES.md section 51 statuses). */
const INVOICEABLE_SALES_ORDER_STATUSES = ['confirmed', 'processing', 'partially_fulfilled', 'fulfilled'];
/** Statuses that still count toward a customer's outstanding exposure (BILLING.md sections 28-29). */
const OUTSTANDING_INVOICE_STATUSES = ['issued', 'partially_paid'] as const;

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly auditService: AuditService,
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  async list(query: ListInvoicesQuery): Promise<ApiCollectionResponse<InvoiceSummary>> {
    const where: Prisma.InvoiceWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerCompanyId) where.customerCompanyId = query.customerCompanyId;
    if (query.q) where.invoiceNumber = { contains: query.q.trim(), mode: 'insensitive' };

    const [rows, totalItems] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: INVOICE_SUMMARY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: rows.map(toInvoiceSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Invoice> {
    return toInvoice(await this.getDetailOrThrow(id));
  }

  async create(dto: CreateInvoiceDto, actorUserId: string): Promise<CreateInvoiceResponse> {
    const customer = await this.assertCompanyExists(dto.customerCompanyId);
    if (dto.contactId) await this.assertContactExists(dto.contactId);

    const treatment = determineTaxTreatment(await this.getSellerStateCode(), customer.stateCode);
    const lines = await this.resolveManualItems(dto.items, treatment);
    const totals = calculateInvoiceTotals(lines);

    const invoiceDate = new Date(dto.invoiceDate);
    const dueDate = await this.resolveDueDate(customer.id, invoiceDate, dto.dueDate);
    const creditWarning = await this.computeCreditWarning(customer.id, totals.totalAmount);

    const invoice = await this.prisma.$transaction(async (tx) => {
      const invoiceNumber = await this.numbering.next(tx, 'invoice', 'INV');

      return tx.invoice.create({
        data: {
          invoiceNumber,
          customerCompanyId: customer.id,
          contactId: dto.contactId,
          invoiceDate,
          dueDate,
          currencyCode: 'INR',
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxableAmount: totals.taxableAmount,
          cgstAmount: totals.cgstAmount,
          sgstAmount: totals.sgstAmount,
          igstAmount: totals.igstAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          customerNameSnapshot: customer.name,
          customerGstinSnapshot: customer.gstin,
          placeOfSupplyCode: customer.stateCode,
          notes: dto.notes,
          terms: dto.terms,
          createdBy: actorUserId,
          items: { create: lines.map((line, index) => ({ ...toItemCreateInput(line), sortOrder: index })) },
        },
        include: INVOICE_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
    });

    return { invoice: toInvoice(invoice), creditWarning };
  }

  /** API.md section 77: the preferred path - snapshots commercial data straight from the order rather than having the client re-enter it. */
  async createFromSalesOrder(
    salesOrderId: string,
    dto: CreateInvoiceFromSalesOrderDto,
    actorUserId: string,
  ): Promise<CreateInvoiceResponse> {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: { orderBy: { sortOrder: 'asc' } }, customer: true },
    });
    if (!salesOrder) {
      throw new NotFoundError('Sales order not found.');
    }
    if (!INVOICEABLE_SALES_ORDER_STATUSES.includes(salesOrder.status)) {
      throw new BusinessRuleError(
        'INVALID_STATE_TRANSITION',
        `A sales order in "${salesOrder.status}" status cannot be invoiced.`,
      );
    }

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { salesOrderId, status: { not: 'cancelled' } },
    });
    if (existingInvoice) {
      throw new ConflictError('This sales order has already been invoiced.');
    }

    const treatment = determineTaxTreatment(await this.getSellerStateCode(), salesOrder.customer.stateCode);
    const lines = salesOrder.items.map((item) => resolveInvoiceLineFromSalesOrderItem(item, treatment));
    const totals = calculateInvoiceTotals(lines);

    const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
    const dueDate = await this.resolveDueDate(salesOrder.customerCompanyId, invoiceDate, dto.dueDate);
    const creditWarning = await this.computeCreditWarning(salesOrder.customerCompanyId, totals.totalAmount);

    const invoice = await this.prisma.$transaction(async (tx) => {
      const invoiceNumber = await this.numbering.next(tx, 'invoice', 'INV');

      return tx.invoice.create({
        data: {
          invoiceNumber,
          salesOrderId: salesOrder.id,
          customerCompanyId: salesOrder.customerCompanyId,
          contactId: salesOrder.contactId,
          invoiceDate,
          dueDate,
          currencyCode: salesOrder.currencyCode,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxableAmount: totals.taxableAmount,
          cgstAmount: totals.cgstAmount,
          sgstAmount: totals.sgstAmount,
          igstAmount: totals.igstAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          customerNameSnapshot: salesOrder.customer.name,
          customerGstinSnapshot: salesOrder.customer.gstin,
          placeOfSupplyCode: salesOrder.customer.stateCode,
          notes: salesOrder.notes,
          terms: salesOrder.terms,
          createdBy: actorUserId,
          items: { create: lines.map((line, index) => ({ ...toItemCreateInput(line), sortOrder: index })) },
        },
        include: INVOICE_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'invoice.created_from_sales_order',
      entityType: 'invoice',
      entityId: invoice.id,
      metadata: { salesOrderId },
    });

    return { invoice: toInvoice(invoice), creditWarning };
  }

  async update(id: string, dto: UpdateInvoiceDto, actorUserId: string): Promise<Invoice> {
    const existing = await this.getDetailOrThrow(id);
    if (existing.status !== 'draft') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a draft invoice can be edited.');
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        terms: dto.terms,
      },
      include: INVOICE_DETAIL_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'invoice.updated',
      entityType: 'invoice',
      entityId: id,
      beforeData: { dueDate: existing.dueDate?.toISOString() ?? null },
      afterData: { dueDate: invoice.dueDate?.toISOString() ?? null },
    });

    return toInvoice(invoice);
  }

  /** BILLING.md section 13: issuing is the moment a draft becomes a formal financial document and a real receivable. */
  async issue(id: string, actorUserId: string): Promise<Invoice> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['draft'], 'issued');

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'issued', issuedAt: new Date(), outstandingAmount: existing.totalAmount },
      include: INVOICE_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'invoice.issued',
      entityType: 'invoice',
      entityId: id,
    });
    return toInvoice(invoice);
  }

  async cancel(id: string, dto: CancelInvoiceDto, actorUserId: string): Promise<Invoice> {
    const existing = await this.getDetailOrThrow(id);
    this.assertStatus(existing.status, ['draft', 'issued'], 'cancelled');

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        outstandingAmount: 0,
        notes: appendNote(existing.notes, `Cancelled: ${dto.reason}`),
      },
      include: INVOICE_DETAIL_INCLUDE,
    });
    await this.auditService.record({
      actorUserId,
      action: 'invoice.cancelled',
      entityType: 'invoice',
      entityId: id,
      metadata: { reason: dto.reason },
    });
    return toInvoice(invoice);
  }

  /** API.md section 83 - feeds payment-entry allocation. */
  async getOutstandingInvoicesForCompany(companyId: string): Promise<{ data: OutstandingInvoice[] }> {
    await this.assertCompanyExists(companyId);
    const invoices = await this.prisma.invoice.findMany({
      where: { customerCompanyId: companyId, status: { in: [...OUTSTANDING_INVOICE_STATUSES] } },
      orderBy: [{ dueDate: 'asc' }, { invoiceDate: 'asc' }],
    });
    return { data: invoices.map(toOutstandingInvoice) };
  }

  async getDetailOrThrow(id: string): Promise<InvoiceWithDetailRelations> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: INVOICE_DETAIL_INCLUDE });
    if (!invoice) {
      throw new NotFoundError('Invoice not found.');
    }
    return invoice;
  }

  private assertStatus(current: string, allowed: string[], action: string): void {
    if (!allowed.includes(current)) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', `An invoice in "${current}" status cannot be ${action}.`);
    }
  }

  private async getSellerStateCode(): Promise<string | null> {
    const setting = await this.prisma.applicationSetting.findUnique({
      where: { key: SELLER_STATE_CODE_SETTING_KEY },
    });
    return setting?.value ?? null;
  }

  private async resolveDueDate(companyId: string, invoiceDate: Date, explicitDueDate?: string): Promise<Date | null> {
    if (explicitDueDate) {
      return new Date(explicitDueDate);
    }
    const { paymentTermsDays } = await this.customerProfileService.getEffectiveBillingProfile(companyId);
    if (paymentTermsDays === null || paymentTermsDays === undefined) {
      return null;
    }
    const dueDate = new Date(invoiceDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + paymentTermsDays);
    return dueDate;
  }

  /**
   * BILLING.md sections 28-29: a non-blocking signal only - no Credit
   * Override/approval permission is modeled, so this never blocks creation.
   * Drafts do not yet count as outstanding (BILLING.md section 13), so this
   * previews what the customer's exposure would become once issued.
   */
  private async computeCreditWarning(companyId: string, newInvoiceTotal: Prisma.Decimal): Promise<CreditLimitWarning | null> {
    const { creditLimit } = await this.customerProfileService.getEffectiveBillingProfile(companyId);
    if (!creditLimit) {
      return null;
    }

    const aggregate = await this.prisma.invoice.aggregate({
      where: { customerCompanyId: companyId, status: { in: [...OUTSTANDING_INVOICE_STATUSES] } },
      _sum: { outstandingAmount: true },
    });
    const outstandingBefore = new Prisma.Decimal(aggregate._sum.outstandingAmount ?? 0);
    const outstandingAfter = outstandingBefore.plus(newInvoiceTotal);
    if (outstandingAfter.lessThanOrEqualTo(creditLimit)) {
      return null;
    }

    return {
      creditLimit: creditLimit.toString(),
      outstandingBefore: outstandingBefore.toString(),
      outstandingAfter: outstandingAfter.toString(),
    };
  }

  private async resolveManualItems(items: InvoiceItemDto[], treatment: ReturnType<typeof determineTaxTreatment>) {
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
      return resolveInvoiceLineFromRequest(product, item, treatment);
    });
  }

  private async assertCompanyExists(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError('Customer company not found.');
    }
    return company;
  }

  private async assertContactExists(id: string): Promise<void> {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundError('Contact not found.');
    }
  }
}

function toItemCreateInput(line: ResolvedInvoiceLine & { salesOrderItemId?: string }) {
  return {
    productId: line.productId,
    salesOrderItemId: line.salesOrderItemId,
    skuSnapshot: line.skuSnapshot,
    productNameSnapshot: line.productNameSnapshot,
    descriptionSnapshot: line.descriptionSnapshot,
    hsnSnapshot: line.hsnSnapshot,
    unitSnapshot: line.unitSnapshot,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    discountPercentage: line.discountPercentage,
    discountAmount: line.discountAmount,
    taxableAmount: line.taxableAmount,
    taxRate: line.taxRate,
    cgstRate: line.cgstRate,
    cgstAmount: line.cgstAmount,
    sgstRate: line.sgstRate,
    sgstAmount: line.sgstAmount,
    igstRate: line.igstRate,
    igstAmount: line.igstAmount,
    taxAmount: line.taxAmount,
    lineTotal: line.lineTotal,
  };
}

function appendNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}
