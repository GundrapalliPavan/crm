import type { InvoiceStatus } from '@crm/types';

/** Mirrors features/quotations/status.ts's tone-grouping approach. */
const STATUS_COLOR: Record<InvoiceStatus, string> = {
  draft: '#64748b',
  issued: '#2563eb',
  partially_paid: '#d97706',
  paid: '#16a34a',
  cancelled: '#64748b',
  credited: '#64748b',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function invoiceStatusColor(status: InvoiceStatus): string {
  return STATUS_COLOR[status];
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return toTitleCase(status);
}
