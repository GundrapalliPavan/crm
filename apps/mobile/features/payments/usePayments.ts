import { useQuery } from '@tanstack/react-query';
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
