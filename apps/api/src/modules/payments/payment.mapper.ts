import { Prisma } from '@prisma/client';
import type {
  Payment as PrismaPayment,
  PaymentAllocation as PrismaPaymentAllocation,
  Company,
  Invoice,
} from '@prisma/client';
import type { Payment, PaymentAllocation, PaymentSummary } from '@crm/types';

type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;
type InvoiceRef = Pick<Invoice, 'id' | 'invoiceNumber'>;

/** `allocatedAmount` is loaded even in the summary shape - unallocatedAmount must be correct everywhere, not just on the detail view. */
export const PAYMENT_SUMMARY_INCLUDE = {
  customer: { select: { id: true, name: true, companyType: true } },
  allocations: { select: { allocatedAmount: true } },
} as const;

export const PAYMENT_DETAIL_INCLUDE = {
  customer: { select: { id: true, name: true, companyType: true } },
  allocations: { include: { invoice: { select: { id: true, invoiceNumber: true } } } },
} as const;

export type PaymentWithSummaryRelations = PrismaPayment & {
  customer: CompanyRef;
  allocations: Pick<PrismaPaymentAllocation, 'allocatedAmount'>[];
};

export type PaymentWithDetailRelations = PrismaPayment & {
  customer: CompanyRef;
  allocations: (PrismaPaymentAllocation & { invoice: InvoiceRef })[];
};

function unallocatedAmount(payment: PrismaPayment, allocations: PrismaPaymentAllocation[]): Prisma.Decimal {
  const allocated = allocations.reduce((sum, allocation) => sum.plus(allocation.allocatedAmount), new Prisma.Decimal(0));
  return payment.amount.minus(allocated);
}

function toPaymentHeader(payment: PaymentWithSummaryRelations, allocations: PrismaPaymentAllocation[]) {
  return {
    id: payment.id,
    paymentNumber: payment.paymentNumber,
    customer: payment.customer,
    paymentDate: payment.paymentDate.toISOString().slice(0, 10),
    amount: payment.amount.toString(),
    unallocatedAmount: unallocatedAmount(payment, allocations).toString(),
    currencyCode: payment.currencyCode,
    paymentMethod: payment.paymentMethod,
    referenceNumber: payment.referenceNumber,
    status: payment.status,
    notes: payment.notes,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

/** List rows omit the per-invoice breakdown, but still load enough to report an accurate `unallocatedAmount` (CLAUDE.md section 17). */
export function toPaymentSummary(payment: PaymentWithSummaryRelations): PaymentSummary {
  return toPaymentHeader(payment, payment.allocations as PrismaPaymentAllocation[]);
}

export function toPaymentAllocation(allocation: PrismaPaymentAllocation & { invoice: InvoiceRef }): PaymentAllocation {
  return {
    id: allocation.id,
    invoiceId: allocation.invoiceId,
    invoiceNumber: allocation.invoice.invoiceNumber,
    allocatedAmount: allocation.allocatedAmount.toString(),
  };
}

export function toPayment(payment: PaymentWithDetailRelations): Payment {
  return {
    ...toPaymentHeader(payment, payment.allocations),
    allocations: payment.allocations.map(toPaymentAllocation),
  };
}
