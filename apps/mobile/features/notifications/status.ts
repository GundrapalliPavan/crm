import type { NotificationType } from '@crm/types';

/** Mirrors features/quotations/status.ts's tone-grouping approach. */
const TYPE_COLOR: Record<NotificationType, string> = {
  lead_assigned: '#2563eb',
  quotation_approval_required: '#d97706',
  purchase_order_approval_required: '#d97706',
  payment_received: '#16a34a',
  low_stock: '#dc2626',
  quotation_decided: '#2563eb',
  sales_order_status_changed: '#2563eb',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  lead_assigned: 'Lead',
  quotation_approval_required: 'Quotation',
  purchase_order_approval_required: 'Purchase Order',
  payment_received: 'Payment',
  low_stock: 'Stock',
  quotation_decided: 'Quotation',
  sales_order_status_changed: 'Order',
};

export function notificationTypeColor(type: NotificationType): string {
  return TYPE_COLOR[type];
}

export function notificationTypeLabel(type: NotificationType): string {
  return TYPE_LABEL[type];
}
