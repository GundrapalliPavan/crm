import type { File as PrismaFile, FileLink as PrismaFileLink, User } from '@prisma/client';
import type { FileAttachment } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const FILE_LINK_INCLUDE = {
  file: { include: { uploader: { select: { id: true, firstName: true, lastName: true } } } },
} as const;

export type FileLinkWithRelations = PrismaFileLink & {
  file: PrismaFile & { uploader: UserRef | null };
};

/**
 * One `File` links to exactly one entity in this pass (upload always creates
 * both rows together), so the `FileLink` - not the bare `File` - is the
 * natural root for "what's attached to this record."
 */
export function toFileAttachment(link: FileLinkWithRelations): FileAttachment {
  return {
    id: link.file.id,
    originalFilename: link.file.originalFilename,
    mimeType: link.file.mimeType,
    sizeBytes: Number(link.file.sizeBytes),
    purpose: link.purpose,
    relatedEntityType: link.entityType,
    relatedEntityId: link.entityId,
    uploadedBy: link.file.uploader,
    createdAt: link.file.createdAt.toISOString(),
  };
}
