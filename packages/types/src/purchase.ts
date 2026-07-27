/**
 * Purchase module contracts (Module 5 - see PURCHASE.md section 118,
 * DATABASE.md sections 61-65, API.md sections 69-74).
 *
 * Scope for this pass: Suppliers (a thin profile over the existing
 * Company/Contact infrastructure - a supplier is a Company with
 * `isSupplier: true`; supplier contacts reuse the existing Contact model,
 * no new backend), Purchase Orders (creation, calculations, the
 * draft/approval/send workflow - every PO requires approval, unlike
 * Quotations' discount-conditional gate, since PURCHASE.md frames a PO
 * itself as "an approved commercial commitment"), and Goods Receipts
 * (recording a delivery against a PO, which closes the loop on Inventory's
 * deferred Receiving tier by crediting real stock). RFQ/Supplier
 * Quotations/Quote Comparison, Purchase Requisitions/Requirements,
 * Procurement Planning, PO Amendment/Versioning, Purchase Returns, Supplier
 * Performance/Price Trends/Analytics, and PDF/WhatsApp/Email sending are
 * explicitly deferred - none are backed by the schema yet.
 */

import type { CompanySummary } from './crm';
import type { WarehouseSummary } from './inventory';

export interface SupplierProfile {
  companyId: string;
  supplierCode: string | null;
  paymentTermsDays: number | null;
  supplierSince: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSupplierProfileRequest {
  supplierCode?: string;
  paymentTermsDays?: number;
  supplierSince?: string;
  notes?: string;
}

export const PURCHASE_ORDER_STATUSES = [
  'draft',
  'approval_pending',
  'approved',
  'sent',
  'supplier_confirmed',
  'partially_received',
  'received',
  'closed',
  'cancelled',
] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  description: string | null;
  hsnCode: string | null;
  unit: string;
  orderedQuantity: string;
  receivedQuantity: string;
  unitPrice: string;
  discountPercentage: string;
  discountAmount: string;
  taxRate: string;
  taxAmount: string;
  lineTotal: string;
  sortOrder: number;
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  orderedQuantity: string;
  unitPrice: string;
  discountPercentage?: string;
}

interface PurchaseOrderHeader {
  id: string;
  poNumber: string;
  supplier: CompanySummary;
  poDate: string;
  expectedDeliveryDate: string | null;
  status: PurchaseOrderStatus;
  currencyCode: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  notes: string | null;
  terms: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** List rows omit items - CLAUDE.md section 17: list APIs return list-appropriate data. */
export type PurchaseOrderSummary = PurchaseOrderHeader;

export interface PurchaseOrder extends PurchaseOrderHeader {
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderRequest {
  supplierCompanyId: string;
  poDate: string;
  expectedDeliveryDate?: string;
  items: CreatePurchaseOrderItemRequest[];
  notes?: string;
  terms?: string;
}

export type UpdatePurchaseOrderRequest = Partial<Omit<CreatePurchaseOrderRequest, 'items'>> & {
  items?: CreatePurchaseOrderItemRequest[];
};

export interface CancelPurchaseOrderRequest {
  reason: string;
}

export interface GoodsReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  sku: string;
  productName: string;
  quantityReceived: string;
  acceptedQuantity: string;
  rejectedQuantity: string;
  notes: string | null;
}

export interface CreateGoodsReceiptItemRequest {
  purchaseOrderItemId: string;
  quantityReceived: string;
  /** Defaults to 0 - only the accepted portion (quantityReceived - rejectedQuantity) is added to stock. */
  rejectedQuantity?: string;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  warehouse: WarehouseSummary;
  receiptDate: string;
  supplierDocumentNumber: string | null;
  notes: string | null;
  items: GoodsReceiptItem[];
  createdAt: string;
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  warehouseId: string;
  receiptDate: string;
  supplierDocumentNumber?: string;
  notes?: string;
  items: CreateGoodsReceiptItemRequest[];
}
