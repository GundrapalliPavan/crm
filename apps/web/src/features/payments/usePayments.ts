import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelPaymentRequest, CreatePaymentRequest } from '@crm/types';
import { paymentsApi, type ListPaymentsParams } from './api';

const paymentKeys = {
  all: ['payments'] as const,
  list: (params: ListPaymentsParams) => [...paymentKeys.all, 'list', params] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
};

export function usePaymentsList(params: ListPaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.list(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePaymentRequest) => paymentsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // A payment mutates invoice paid/outstanding amounts and status.
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: ['outstanding-invoices'] });
    },
  });
}

export function useCancelPayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CancelPaymentRequest) => paymentsApi.cancel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      void queryClient.invalidateQueries({ queryKey: ['outstanding-invoices'] });
    },
  });
}
