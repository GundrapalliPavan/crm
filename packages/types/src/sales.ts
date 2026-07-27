/**
 * Sales module contracts (Module 4 - see SALES.md section 106, DATABASE.md
 * sections 55-59, API.md sections 62-68).
 *
 * Scope for this pass: Quotations (creation, calculations, the
 * draft/approval/send/accept/reject workflow) and Sales Orders (creation,
 * confirmation with a non-blocking stock check, cancellation, completion).
 * "Opportunity" is not a separate entity here - the schema has no Opportunity
 * model, so it is simply a Lead at `status: 'opportunity'` (see crm.ts).
 * Price Lists, customer-specific pricing, quotation versioning, PDF/
 * WhatsApp/Email sending, real credit-check against outstanding balance, and
 * partial-availability/backorder workflows are explicitly deferred - none
 * are backed by the schema yet, or depend on a module (Billing, Inventory's
 * Fulfilment tier) that does not exist.
 */

import type { CompanySummary, ContactSummary, UserSummary } from './crm';

export const QUOTATION_STATUSES = [
  'draft',
  'approval_pending',
  'approved',
  'sent',
  'negotiation',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const SALES_ORDER_STATUSES = [
  'draft',
  'confirmation_pending',
  'confirmed',
  'processing',
  'partially_fulfilled',
  'fulfilled',
  'cancelled',
] as const;
export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number];

/** A commercial line item's snapshot fields describe the product as it was when quoted/ordered, not its current state. */
export interface QuotationItem {
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
  taxRate: string;
  taxAmount: string;
  lineTotal: string;
  sortOrder: number;
}

export interface CreateQuotationItemRequest {
  productId: string;
  quantity: string;
  /** Defaults to the product's `sellingPriceReference` when omitted. */
  unitPrice?: string;
  discountPercentage?: string;
}

interface QuotationHeader {
  id: string;
  quotationNumber: string;
  customer: CompanySummary;
  contact: ContactSummary | null;
  leadId: string | null;
  quotationDate: string;
  validUntil: string | null;
  status: QuotationStatus;
  currencyCode: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  notes: string | null;
  terms: string | null;
  owner: UserSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** List rows omit items - CLAUDE.md section 17: list APIs return list-appropriate data. */
export type QuotationSummary = QuotationHeader;

export interface Quotation extends QuotationHeader {
  items: QuotationItem[];
}

export interface CreateQuotationRequest {
  customerCompanyId: string;
  contactId?: string;
  leadId?: string;
  quotationDate: string;
  validUntil?: string;
  items: CreateQuotationItemRequest[];
  notes?: string;
  terms?: string;
}

/** Only permitted while the quotation is still `draft`. */
export type UpdateQuotationRequest = Partial<Omit<CreateQuotationRequest, 'items'>> & {
  items?: CreateQuotationItemRequest[];
};

export interface CancelQuotationRequest {
  reason: string;
}

export interface SalesOrderItem {
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
  taxRate: string;
  taxAmount: string;
  lineTotal: string;
  fulfilledQuantity: string;
  sortOrder: number;
}

export interface CreateSalesOrderItemRequest {
  productId: string;
  quantity: string;
  unitPrice?: string;
  discountPercentage?: string;
}

interface SalesOrderHeader {
  id: string;
  salesOrderNumber: string;
  quotationId: string | null;
  customer: CompanySummary;
  contact: ContactSummary | null;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: SalesOrderStatus;
  currencyCode: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  notes: string | null;
  terms: string | null;
  owner: UserSummary | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SalesOrderSummary = SalesOrderHeader;

export interface SalesOrder extends SalesOrderHeader {
  items: SalesOrderItem[];
}

export interface CreateSalesOrderRequest {
  customerCompanyId: string;
  contactId?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: CreateSalesOrderItemRequest[];
  notes?: string;
  terms?: string;
}

export type UpdateSalesOrderRequest = Partial<Omit<CreateSalesOrderRequest, 'items'>> & {
  items?: CreateSalesOrderItemRequest[];
};

export interface CancelSalesOrderRequest {
  reason: string;
}

/**
 * API.md section 68 / SALES.md section 55: a shortage is a warning, not a
 * blocking error - Inventory remains authoritative, and Sales never writes to
 * stock (reservations are Inventory's deferred Sales Allocation tier).
 */
export interface SalesOrderStockWarning {
  productId: string;
  sku: string;
  productName: string;
  orderedQuantity: string;
  availableQuantity: string;
}

export interface ConfirmSalesOrderResponse {
  salesOrder: SalesOrder;
  stockWarnings: SalesOrderStockWarning[];
}
