import type { SalesOrderStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  draft: 'Draft',
  confirmation_pending: 'Confirmation Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  partially_fulfilled: 'Partially Fulfilled',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export function salesOrderStatusLabel(status: SalesOrderStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<SalesOrderStatus, BadgeTone> = {
  draft: 'neutral',
  confirmation_pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  partially_fulfilled: 'warning',
  fulfilled: 'success',
  cancelled: 'critical',
};

export function salesOrderStatusTone(status: SalesOrderStatus): BadgeTone {
  return STATUS_TONES[status];
}
