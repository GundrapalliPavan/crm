/**
 * Internal domain events (ARCHITECTURE.md sections 78-79: "Use events where
 * they reduce coupling... the architecture remains a modular monolith").
 * Emitted via Nest's own in-process `EventEmitter2` - no external event
 * infrastructure. Business services emit; `NotificationTriggersListener`
 * reacts. Adding a new listener (audit, communication, background work)
 * later never requires changing the module that emits.
 */
export const DOMAIN_EVENTS = {
  leadAssigned: 'lead.assigned',
  quotationApprovalRequired: 'quotation.approval_required',
  purchaseOrderApprovalRequired: 'purchase_order.approval_required',
  paymentReceived: 'payment.received',
  lowStock: 'inventory.low_stock',
  quotationDecided: 'quotation.decided',
  salesOrderStatusChanged: 'sales_order.status_changed',
} as const;

export interface LeadAssignedEvent {
  leadId: string;
  leadName: string;
  assigneeUserId: string;
}

export interface QuotationApprovalRequiredEvent {
  quotationId: string;
  quotationNumber: string;
}

export interface PurchaseOrderApprovalRequiredEvent {
  purchaseOrderId: string;
  purchaseOrderNumber: string;
}

export interface PaymentReceivedEvent {
  paymentId: string;
  paymentNumber: string;
  companyOwnerUserId: string;
}

export interface LowStockEvent {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
}

/** MOBILE_ARCHITECTURE.md section 9 - notifies the quotation's owner (the sales rep), not the approver. */
export interface QuotationDecidedEvent {
  quotationId: string;
  quotationNumber: string;
  decision: 'accepted' | 'rejected';
  ownerId: string | null;
}

/** MOBILE_ARCHITECTURE.md section 9 - fired on confirm/cancel/complete. */
export interface SalesOrderStatusChangedEvent {
  salesOrderId: string;
  salesOrderNumber: string;
  status: string;
  ownerId: string | null;
}
