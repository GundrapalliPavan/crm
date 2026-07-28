import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FileAttachment, ListFileAttachmentsQuery } from '@crm/types';
import { filesApi, type UploadFileParams } from './api';

const fileKeys = {
  list: (query: ListFileAttachmentsQuery) => ['files', 'list', query] as const,
};

export function useFileAttachments(query: ListFileAttachmentsQuery) {
  return useQuery({
    queryKey: fileKeys.list(query),
    queryFn: () => filesApi.list(query),
  });
}

export function useUploadFile(query: ListFileAttachmentsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UploadFileParams) => filesApi.upload(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fileKeys.list(query) });
    },
  });
}

export function useDeleteFile(query: ListFileAttachmentsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => filesApi.delete(fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fileKeys.list(query) });
    },
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: (file: FileAttachment) => filesApi.download(file),
  });
}
