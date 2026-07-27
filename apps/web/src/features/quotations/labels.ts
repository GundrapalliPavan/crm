import type { QuotationStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  approval_pending: 'Approval Pending',
  approved: 'Approved',
  sent: 'Sent',
  negotiation: 'Negotiation',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export function quotationStatusLabel(status: QuotationStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<QuotationStatus, BadgeTone> = {
  draft: 'neutral',
  approval_pending: 'warning',
  approved: 'info',
  sent: 'info',
  negotiation: 'warning',
  accepted: 'success',
  rejected: 'critical',
  expired: 'critical',
  cancelled: 'critical',
};

export function quotationStatusTone(status: QuotationStatus): BadgeTone {
  return STATUS_TONES[status];
}
