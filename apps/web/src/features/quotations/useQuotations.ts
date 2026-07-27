import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelQuotationRequest, CreateQuotationRequest, UpdateQuotationRequest } from '@crm/types';
import { quotationsApi, type ListQuotationsParams } from './api';

const quotationKeys = {
  all: ['quotations'] as const,
  list: (params: ListQuotationsParams) => [...quotationKeys.all, 'list', params] as const,
  detail: (id: string) => [...quotationKeys.all, 'detail', id] as const,
};

export function useQuotationsList(params: ListQuotationsParams) {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => quotationsApi.list(params),
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => quotationsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateQuotationRequest) => quotationsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}

export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateQuotationRequest) => quotationsApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}

/** Every status-transition action invalidates the same queries, so they share one mutation shape. */
function useQuotationAction(id: string, action: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => action(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}

export function useSubmitQuotation(id: string) {
  return useQuotationAction(id, quotationsApi.submit);
}

export function useApproveQuotation(id: string) {
  return useQuotationAction(id, quotationsApi.approve);
}

export function useRejectQuotationApproval(id: string) {
  return useQuotationAction(id, quotationsApi.rejectApproval);
}

export function useSendQuotation(id: string) {
  return useQuotationAction(id, quotationsApi.send);
}

export function useAcceptQuotation(id: string) {
  return useQuotationAction(id, quotationsApi.accept);
}

export function useRejectQuotation(id: string) {
  return useQuotationAction(id, quotationsApi.reject);
}

export function useCancelQuotation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CancelQuotationRequest) => quotationsApi.cancel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}

export function useConvertQuotationToOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => quotationsApi.convertToOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}
