import { apiClient } from './client';

/** Fetches a binary response and triggers a browser download - shared by CSV exports and file attachment downloads. */
export async function downloadBlob(path: string, filename: string, params?: object): Promise<void> {
  const { data } = await apiClient.get<Blob>(path, { params, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
