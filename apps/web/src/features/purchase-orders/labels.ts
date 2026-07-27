import type { PurchaseOrderStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  approval_pending: 'Approval Pending',
  approved: 'Approved',
  sent: 'Sent',
  supplier_confirmed: 'Supplier Confirmed',
  partially_received: 'Partially Received',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export function purchaseOrderStatusLabel(status: PurchaseOrderStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<PurchaseOrderStatus, BadgeTone> = {
  draft: 'neutral',
  approval_pending: 'warning',
  approved: 'info',
  sent: 'info',
  supplier_confirmed: 'info',
  partially_received: 'warning',
  received: 'success',
  closed: 'neutral',
  cancelled: 'critical',
};

export function purchaseOrderStatusTone(status: PurchaseOrderStatus): BadgeTone {
  return STATUS_TONES[status];
}
