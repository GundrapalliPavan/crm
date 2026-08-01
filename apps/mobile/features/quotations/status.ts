import type { QuotationStatus } from '@crm/types';

/** Mirrors features/leads/status.ts's tone-grouping approach for the quotation lifecycle. */
const STATUS_COLOR: Record<QuotationStatus, string> = {
  draft: '#64748b',
  approval_pending: '#d97706',
  approved: '#2563eb',
  sent: '#2563eb',
  negotiation: '#d97706',
  accepted: '#16a34a',
  rejected: '#dc2626',
  expired: '#64748b',
  cancelled: '#64748b',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function quotationStatusColor(status: QuotationStatus): string {
  return STATUS_COLOR[status];
}

export function quotationStatusLabel(status: QuotationStatus): string {
  return toTitleCase(status);
}

export function previewLineTotal(
  quantity: string,
  unitPrice: string,
  discountPercentage: string,
  taxRate: string,
): number {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const discountPct = Number(discountPercentage) || 0;
  const tax = Number(taxRate) || 0;

  const gross = qty * price;
  const discountAmount = (gross * discountPct) / 100;
  const taxableValue = gross - discountAmount;
  const taxAmount = (taxableValue * tax) / 100;
  return Math.round((taxableValue + taxAmount) * 100) / 100;
}
