import type { InvoiceStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  cancelled: 'Cancelled',
  credited: 'Credited',
};

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  issued: 'info',
  partially_paid: 'warning',
  paid: 'success',
  cancelled: 'critical',
  credited: 'neutral',
};

export function invoiceStatusTone(status: InvoiceStatus): BadgeTone {
  return STATUS_TONES[status];
}
