import { useRef, useState } from 'react';
import type { FileAttachment, RelatedEntityType } from '@crm/types';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/lib/auth/useAuth';
import { ApiError } from '@/lib/api/api-error';
import { defaultPurposeFor, formatFileSize } from './purpose';
import { useDeleteFile, useDownloadFile, useFileAttachments, useUploadFile } from './useFiles';

export interface FileAttachmentsSectionProps {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}

/** ARCHITECTURE.md sections 62-67 - a platform capability, embedded the same way on every detail page that can carry attachments. */
export function FileAttachmentsSection({ relatedEntityType, relatedEntityId }: FileAttachmentsSectionProps) {
  const { can } = useAuth();
  const query = { relatedEntityType, relatedEntityId };
  const { data, isLoading } = useFileAttachments(query);
  const uploadFile = useUploadFile(query);
  const deleteFile = useDeleteFile(query);
  const downloadFile = useDownloadFile();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FileAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError(null);
    try {
      await uploadFile.mutateAsync({
        file,
        relatedEntityType,
        relatedEntityId,
        purpose: defaultPurposeFor(relatedEntityType),
      });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setUploadError(apiError?.message ?? 'Upload failed. Please try again.');
    }
  }

  return (
    <section className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Attachments</h2>
        {can('file.upload') && (
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => void handleFileSelected(event)} />
            <Button size="sm" variant="secondary" isLoading={uploadFile.isPending} onClick={() => fileInputRef.current?.click()}>
              + Add File
            </Button>
          </>
        )}
      </div>

      {uploadError && (
        <div
          role="alert"
          className="mb-3 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
        >
          {uploadError}
        </div>
      )}

      {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>}

      {!isLoading && data?.data.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">No files attached yet.</p>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.data.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <button
                  type="button"
                  className="truncate text-sm font-medium text-[var(--color-action-primary)] hover:underline"
                  onClick={() => void downloadFile.mutateAsync(file)}
                >
                  {file.originalFilename}
                </button>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  {formatFileSize(file.sizeBytes)}
                  {file.uploadedBy && ` · ${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`}
                  {' · '}
                  {new Date(file.createdAt).toLocaleString()}
                </p>
              </div>
              {can('file.delete') && (
                <Button size="sm" variant="secondary" onClick={() => setPendingDelete(file)}>
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove attachment"
          description={`Remove "${pendingDelete.originalFilename}"? This cannot be undone.`}
          confirmLabel="Remove"
          destructive
          isConfirming={deleteFile.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void deleteFile.mutateAsync(pendingDelete.id).then(() => setPendingDelete(null))}
        />
      )}
    </section>
  );
}
