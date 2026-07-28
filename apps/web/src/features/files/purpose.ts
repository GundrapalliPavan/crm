import type { FilePurpose, RelatedEntityType } from '@crm/types';

/** Picked automatically from the entity being attached to, rather than asking the user to categorize every upload (UX.md's "smart defaults" principle). */
const DEFAULT_PURPOSE_BY_ENTITY: Record<RelatedEntityType, FilePurpose> = {
  lead: 'customer_document',
  contact: 'customer_document',
  company: 'customer_document',
  quotation: 'quotation_attachment',
  sales_order: 'other',
  purchase_order: 'po_attachment',
  goods_receipt: 'other',
  invoice: 'other',
  payment: 'payment_proof',
  product: 'product_document',
};

export function defaultPurposeFor(entityType: RelatedEntityType): FilePurpose {
  return DEFAULT_PURPOSE_BY_ENTITY[entityType];
}

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
