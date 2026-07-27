import type { PaymentMethod, PaymentStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const STATUS_LABELS: Record<PaymentStatus, string> = {
  recorded: 'Recorded',
  cleared: 'Cleared',
  bounced: 'Bounced',
  cancelled: 'Cancelled',
};

export function paymentStatusLabel(status: PaymentStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  recorded: 'success',
  cleared: 'success',
  bounced: 'critical',
  cancelled: 'critical',
};

export function paymentStatusTone(status: PaymentStatus): BadgeTone {
  return STATUS_TONES[status];
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  cheque: 'Cheque',
  cash: 'Cash',
  card: 'Card',
  payment_gateway: 'Payment Gateway',
  other: 'Other',
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return METHOD_LABELS[method];
}
