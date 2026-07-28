import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Payment, PaymentSummary } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { DocumentNumberingService } from '../../common/documents/document-numbering.service';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { emitDomainEvent } from '../../common/events/emit-domain-event';
import { BusinessRuleError, ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQuery } from './dto/list-payments.query';
import { PaymentAllocationDto } from './dto/payment-allocation.dto';
import {
  PAYMENT_DETAIL_INCLUDE,
  PAYMENT_SUMMARY_INCLUDE,
  toPayment,
  toPaymentSummary,
  type PaymentWithDetailRelations,
} from './payment.mapper';

/** Invoices that can still receive a payment allocation (BILLING.md sections 34-36). */
const ALLOCATABLE_INVOICE_STATUSES = ['issued', 'partially_paid'];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: DocumentNumberingService,
    private readonly auditService: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async list(query: ListPaymentsQuery): Promise<ApiCollectionResponse<PaymentSummary>> {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerCompanyId) where.customerCompanyId = query.customerCompanyId;
    if (query.q) where.paymentNumber = { contains: query.q.trim(), mode: 'insensitive' };

    const [rows, totalItems] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: PAYMENT_SUMMARY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: rows.map(toPaymentSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Payment> {
    return toPayment(await this.getDetailOrThrow(id));
  }

  /**
   * DATABASE.md section 77: Create Payment + Create Allocation(s) + Recalculate
   * Invoice Paid/Outstanding/Status, all in one transaction. Allocations may
   * sum to less than `amount` - the remainder stays unallocated (BILLING.md
   * section 38), so `allocations` is optional and not required to exhaust the
   * payment.
   */
  async create(dto: CreatePaymentDto, actorUserId: string): Promise<Payment> {
    await this.assertCompanyExists(dto.customerCompanyId);
    const amount = new Prisma.Decimal(dto.amount);
    if (!amount.isPositive()) {
      throw new ValidationError({ amount: ['Payment amount must be greater than zero.'] });
    }

    const allocations = dto.allocations ?? [];
    await this.assertAllocationsValid(allocations, dto.customerCompanyId, amount);

    const payment = await this.prisma.$transaction(async (tx) => {
      for (const allocation of allocations) {
        await this.applyAllocation(tx, allocation);
      }

      const paymentNumber = await this.numbering.next(tx, 'payment', 'PAY');
      return tx.payment.create({
        data: {
          paymentNumber,
          customerCompanyId: dto.customerCompanyId,
          paymentDate: new Date(dto.paymentDate),
          amount,
          currencyCode: dto.currencyCode ?? 'INR',
          paymentMethod: dto.paymentMethod,
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
          receivedBy: actorUserId,
          createdBy: actorUserId,
          allocations: {
            create: allocations.map((allocation) => ({
              invoiceId: allocation.invoiceId,
              allocatedAmount: new Prisma.Decimal(allocation.amount),
              createdBy: actorUserId,
            })),
          },
        },
        include: PAYMENT_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'payment.recorded',
      entityType: 'payment',
      entityId: payment.id,
      metadata: { allocationCount: allocations.length },
    });

    const company = await this.prisma.company.findUnique({
      where: { id: dto.customerCompanyId },
      select: { ownerId: true },
    });
    if (company?.ownerId) {
      await emitDomainEvent(this.events, DOMAIN_EVENTS.paymentReceived, {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        companyOwnerUserId: company.ownerId,
      });
    }

    return toPayment(payment);
  }

  /**
   * BILLING.md section 39: incorrect payments are reversed, not deleted -
   * allocation rows are kept as history, the invoice amounts they affected
   * are restored, and the payment itself is marked cancelled.
   */
  async cancel(id: string, dto: CancelPaymentDto, actorUserId: string): Promise<Payment> {
    const existing = await this.getDetailOrThrow(id);
    if (existing.status !== 'recorded') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', `A payment in "${existing.status}" status cannot be cancelled.`);
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      for (const allocation of existing.allocations) {
        await this.reverseAllocation(tx, allocation.invoiceId, allocation.allocatedAmount);
      }

      return tx.payment.update({
        where: { id },
        data: {
          status: 'cancelled',
          notes: appendNote(existing.notes, `Cancelled: ${dto.reason}`),
        },
        include: PAYMENT_DETAIL_INCLUDE,
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'payment.cancelled',
      entityType: 'payment',
      entityId: id,
      metadata: { reason: dto.reason },
    });

    return toPayment(payment);
  }

  async getDetailOrThrow(id: string): Promise<PaymentWithDetailRelations> {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: PAYMENT_DETAIL_INCLUDE });
    if (!payment) {
      throw new NotFoundError('Payment not found.');
    }
    return payment;
  }

  /**
   * Pre-validates against the read-time state so validation errors name the
   * actual invoice/amount involved. The transaction's guarded update below is
   * the authoritative safety net against a concurrent allocation racing this
   * one (API.md section 82: never trust a client-calculated outstanding
   * balance, and never re-derive it from a stale read either).
   */
  private async assertAllocationsValid(
    allocations: PaymentAllocationDto[],
    customerCompanyId: string,
    amount: Prisma.Decimal,
  ): Promise<void> {
    if (allocations.length === 0) {
      return;
    }

    const invoiceIds = allocations.map((allocation) => allocation.invoiceId);
    if (new Set(invoiceIds).size !== invoiceIds.length) {
      throw new ValidationError({ allocations: ['Each invoice may only be allocated once per payment.'] });
    }

    const totalAllocated = allocations.reduce((sum, allocation) => sum.plus(new Prisma.Decimal(allocation.amount)), new Prisma.Decimal(0));
    if (totalAllocated.greaterThan(amount)) {
      throw new ValidationError({ allocations: ['Total allocations cannot exceed the payment amount.'] });
    }

    const invoices = await this.prisma.invoice.findMany({ where: { id: { in: invoiceIds } } });
    const byId = new Map(invoices.map((invoice) => [invoice.id, invoice]));

    for (const allocation of allocations) {
      const invoiceAmount = new Prisma.Decimal(allocation.amount);
      if (!invoiceAmount.isPositive()) {
        throw new ValidationError({ allocations: ['Allocation amount must be greater than zero.'] });
      }

      const invoice = byId.get(allocation.invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice ${allocation.invoiceId} not found.`);
      }
      if (invoice.customerCompanyId !== customerCompanyId) {
        throw new ValidationError({ allocations: [`Invoice ${invoice.invoiceNumber} does not belong to this customer.`] });
      }
      if (!ALLOCATABLE_INVOICE_STATUSES.includes(invoice.status)) {
        throw new ValidationError({
          allocations: [`Invoice ${invoice.invoiceNumber} is "${invoice.status}" and cannot receive a payment.`],
        });
      }
      if (invoiceAmount.greaterThan(invoice.outstandingAmount)) {
        throw new ValidationError({
          allocations: [
            `Allocation of ${invoiceAmount.toString()} exceeds the outstanding balance of ${invoice.outstandingAmount.toString()} on invoice ${invoice.invoiceNumber}.`,
          ],
        });
      }
    }
  }

  private async applyAllocation(tx: Prisma.TransactionClient, allocation: PaymentAllocationDto): Promise<void> {
    const amount = allocation.amount;
    const rows = await tx.$queryRaw<{ outstandingAmount: Prisma.Decimal }[]>`
      UPDATE invoices
      SET paid_amount = paid_amount + ${amount}::numeric,
          outstanding_amount = outstanding_amount - ${amount}::numeric,
          status = CASE
            WHEN outstanding_amount - ${amount}::numeric <= 0 THEN 'paid'::invoice_status
            ELSE 'partially_paid'::invoice_status
          END,
          updated_at = now()
      WHERE id = ${allocation.invoiceId}::uuid
        AND status IN ('issued', 'partially_paid')
        AND outstanding_amount >= ${amount}::numeric
      RETURNING outstanding_amount AS "outstandingAmount"
    `;
    if (rows.length === 0) {
      throw new ConflictError('This invoice was modified concurrently - reload and try again.');
    }
  }

  private async reverseAllocation(tx: Prisma.TransactionClient, invoiceId: string, amount: Prisma.Decimal): Promise<void> {
    const rows = await tx.$queryRaw<{ outstandingAmount: Prisma.Decimal }[]>`
      UPDATE invoices
      SET paid_amount = paid_amount - ${amount.toString()}::numeric,
          outstanding_amount = outstanding_amount + ${amount.toString()}::numeric,
          status = CASE
            WHEN paid_amount - ${amount.toString()}::numeric <= 0 THEN 'issued'::invoice_status
            ELSE 'partially_paid'::invoice_status
          END,
          updated_at = now()
      WHERE id = ${invoiceId}::uuid AND paid_amount >= ${amount.toString()}::numeric
      RETURNING outstanding_amount AS "outstandingAmount"
    `;
    if (rows.length === 0) {
      throw new ConflictError('This invoice was modified concurrently - reload and try again.');
    }
  }

  private async assertCompanyExists(id: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError('Customer company not found.');
    }
  }
}

function appendNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}
