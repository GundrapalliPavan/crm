import type { SalesOrderStatus } from '@crm/types';

const STATUS_COLOR: Record<SalesOrderStatus, string> = {
  draft: '#64748b',
  confirmation_pending: '#d97706',
  confirmed: '#2563eb',
  processing: '#2563eb',
  partially_fulfilled: '#d97706',
  fulfilled: '#16a34a',
  cancelled: '#64748b',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function salesOrderStatusColor(status: SalesOrderStatus): string {
  return STATUS_COLOR[status];
}

export function salesOrderStatusLabel(status: SalesOrderStatus): string {
  return toTitleCase(status);
}
