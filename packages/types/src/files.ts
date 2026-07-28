/**
 * File Attachments (platform capability - PROJECT.md sections 12/14/17/20,
 * technical/API.md sections 96-99, technical/DATABASE.md sections 93-95,
 * technical/ARCHITECTURE.md sections 62-67).
 *
 * `File`/`FileLink` existed in the schema since Phase 0 and were completely
 * unused - no migration was needed. One file can attach to any of the same
 * ten entity types Communication already attaches to (`RelatedEntityType`,
 * reused from communication.ts rather than redefined).
 *
 * Scope for this pass: upload, list-by-entity, download, and delete - a
 * direct backend-upload flow (`Client -> Backend -> Object Storage`), not the
 * signed-upload flow API.md section 98 frames as an alternative for larger
 * files. Local development stores files on local disk, a legitimate,
 * documented implementation (PROJECT_SETUP.md section 23), not a stub - a
 * real cloud provider (Google Cloud Storage per PROJECT_SETUP.md) is a later
 * binding swap, same pattern as `CommunicationProvider`. PDF generation
 * (API.md sections 65, 78), the signed-upload flow, malware scanning, and
 * file versioning on regeneration (DATABASE.md section 96) are explicitly
 * deferred.
 */

import type { RelatedEntityType } from './communication';
import type { UserSummary } from './crm';

export const FILE_PURPOSES = [
  'customer_document',
  'quotation_attachment',
  'po_attachment',
  'invoice_pdf',
  'payment_proof',
  'communication_attachment',
  'product_document',
  'other',
] as const;
export type FilePurpose = (typeof FILE_PURPOSES)[number];

export interface FileAttachment {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  purpose: FilePurpose;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  uploadedBy: UserSummary | null;
  createdAt: string;
}

export interface ListFileAttachmentsQuery {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}
