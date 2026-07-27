/**
 * Billing module contracts (Module 6 - see BILLING.md section 121,
 * DATABASE.md sections 68-78, API.md sections 76-83).
 *
 * Scope for this pass: Customer Billing Profile (a thin profile over the
 * existing Company/CustomerProfile, mirroring Module 5's SupplierProfile),
 * Invoices (manual creation and creation from a confirmed Sales Order, full
 * CGST/SGST/IGST calculation, draft edit/issue/cancel, a non-blocking
 * credit-limit warning), Payments (recording with multi-invoice allocation -
 * this also covers advance/unallocated payments, since allocations may sum
 * to less than the payment amount - and cancellation/reversal), and the
 * outstanding-invoices lookup used by payment entry.
 *
 * Credit Notes/Debit Notes, Invoice PDF, Email/WhatsApp sending, Payment
 * Receipts, payment reminders/Promise-to-Pay, Credit Override approval
 * workflows, Supplier Invoice tracking/matching, payment gateway/bank
 * reconciliation and billing analytics/AI are explicitly deferred - none are
 * backed by the schema yet, or depend on communication/file infrastructure
 * that does not exist yet.
 */

import type { CompanySummary, ContactSummary } from './crm';

export const INVOICE_STATUSES = [
  'draft',
  'issued',
  'partially_paid',
  'paid',
  'cancelled',
  'credited',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ['recorded', 'cleared', 'bounced', 'cancelled'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  'bank_transfer',
  'upi',
  'cheque',
  'cash',
  'card',
  'payment_gateway',
  'other',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface CustomerProfile {
  companyId: string;
  customerCode: string | null;
  creditLimit: string | null;
  paymentTermsDays: number | null;
  customerSince: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCustomerProfileRequest {
  customerCode?: string;
  creditLimit?: string;
  paymentTermsDays?: number;
  customerSince?: string;
}

/** GST breakdown is snapshotted per line - a later product/tax-rate change must not retroactively alter an issued invoice. */
export interface InvoiceItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  description: string | null;
  hsnCode: string | null;
  unit: string;
  quantity: string;
  unitPrice: string;
  discountPercentage: string;
  discountAmount: string;
  taxableAmount: string;
  taxRate: string;
  cgstRate: string;
  cgstAmount: string;
  sgstRate: string;
  sgstAmount: string;
  igstRate: string;
  igstAmount: string;
  taxAmount: string;
  lineTotal: string;
  sortOrder: number;
}

export interface CreateInvoiceItemRequest {
  productId: string;
  quantity: string;
  /** Defaults to the product's `sellingPriceReference` when omitted. */
  unitPrice?: string;
  discountPercentage?: string;
}

interface InvoiceHeader {
  id: string;
  invoiceNumber: string;
  salesOrderId: string | null;
  customer: CompanySummary;
  contact: ContactSummary | null;
  invoiceDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  currencyCode: string;
  subtotal: string;
  discountAmount: string;
  taxableAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
  customerNameSnapshot: string;
  customerGstinSnapshot: string | null;
  placeOfSupplyCode: string | null;
  notes: string | null;
  terms: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** List rows omit items - CLAUDE.md section 17: list APIs return list-appropriate data. */
export type InvoiceSummary = InvoiceHeader;

export interface Invoice extends InvoiceHeader {
  items: InvoiceItem[];
}

/** Manual billing (BILLING.md section 8) - the invoice is not tied to a Sales Order. */
export interface CreateInvoiceRequest {
  customerCompanyId: string;
  contactId?: string;
  invoiceDate: string;
  dueDate?: string;
  items: CreateInvoiceItemRequest[];
  notes?: string;
  terms?: string;
}

/** Only permitted while the invoice is still `draft` (BILLING.md section 13). Items are not editable - see invoices.service.ts. */
export interface UpdateInvoiceRequest {
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
}

export interface CancelInvoiceRequest {
  reason: string;
}

/** API.md section 77 - dates default to today / the customer's payment terms when omitted. */
export interface CreateInvoiceFromSalesOrderRequest {
  invoiceDate?: string;
  dueDate?: string;
}

/**
 * BILLING.md sections 28-29: a non-blocking signal - Billing provides the
 * authoritative exposure figure, but does not gate invoice creation on it
 * (no Credit Override/approval permission is modeled yet).
 */
export interface CreditLimitWarning {
  creditLimit: string;
  outstandingBefore: string;
  outstandingAfter: string;
}

export interface CreateInvoiceResponse {
  invoice: Invoice;
  creditWarning: CreditLimitWarning | null;
}

export interface PaymentAllocation {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmount: string;
}

export interface CreatePaymentAllocationRequest {
  invoiceId: string;
  amount: string;
}

interface PaymentHeader {
  id: string;
  paymentNumber: string;
  customer: CompanySummary;
  paymentDate: string;
  amount: string;
  /** amount minus the sum of this payment's allocations - an advance/unallocated balance still awaiting invoice assignment. */
  unallocatedAmount: string;
  currencyCode: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentSummary = PaymentHeader;

export interface Payment extends PaymentHeader {
  allocations: PaymentAllocation[];
}

export interface CreatePaymentRequest {
  customerCompanyId: string;
  paymentDate: string;
  amount: string;
  currencyCode?: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  /** May sum to less than `amount` - the remainder stays unallocated (BILLING.md section 38). */
  allocations?: CreatePaymentAllocationRequest[];
}

export interface CancelPaymentRequest {
  reason: string;
}

/** API.md section 83 - feeds the payment-entry allocation picker. */
export interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
}
