import type { FileAttachment, FilePurpose, ListFileAttachmentsQuery, RelatedEntityType } from '@crm/types';
import { apiClient } from '@/lib/api/client';
import { downloadBlob } from '@/lib/api/download-blob';

export interface UploadFileParams {
  file: File;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  purpose: FilePurpose;
}

export const filesApi = {
  async list(query: ListFileAttachmentsQuery): Promise<{ data: FileAttachment[] }> {
    const { data } = await apiClient.get<{ data: FileAttachment[] }>('/files', { params: query });
    return data;
  },

  async upload(params: UploadFileParams): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('relatedEntityType', params.relatedEntityType);
    formData.append('relatedEntityId', params.relatedEntityId);
    formData.append('purpose', params.purpose);

    const { data } = await apiClient.post<FileAttachment>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  download(file: FileAttachment): Promise<void> {
    return downloadBlob(`/files/${file.id}/download`, file.originalFilename);
  },

  async delete(fileId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}`);
  },
};
