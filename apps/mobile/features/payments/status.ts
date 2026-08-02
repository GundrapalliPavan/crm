import type { PaymentMethod, PaymentStatus } from '@crm/types';

/** Mirrors features/quotations/status.ts's tone-grouping approach. */
const STATUS_COLOR: Record<PaymentStatus, string> = {
  recorded: '#2563eb',
  cleared: '#16a34a',
  bounced: '#dc2626',
  cancelled: '#64748b',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function paymentStatusColor(status: PaymentStatus): string {
  return STATUS_COLOR[status];
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return toTitleCase(status);
}

export function paymentMethodLabel(method: PaymentMethod): string {
  return method === 'upi' ? 'UPI' : toTitleCase(method);
}
