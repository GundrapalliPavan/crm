import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelSalesOrderRequest, CreateSalesOrderRequest, UpdateSalesOrderRequest } from '@crm/types';
import { salesOrdersApi, type ListSalesOrdersParams } from './api';

const salesOrderKeys = {
  all: ['sales-orders'] as const,
  list: (params: ListSalesOrdersParams) => [...salesOrderKeys.all, 'list', params] as const,
  detail: (id: string) => [...salesOrderKeys.all, 'detail', id] as const,
};

export function useSalesOrdersList(params: ListSalesOrdersParams) {
  return useQuery({
    queryKey: salesOrderKeys.list(params),
    queryFn: () => salesOrdersApi.list(params),
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: salesOrderKeys.detail(id),
    queryFn: () => salesOrdersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSalesOrderRequest) => salesOrdersApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
}

export function useUpdateSalesOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateSalesOrderRequest) => salesOrdersApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
}

export function useConfirmSalesOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => salesOrdersApi.confirm(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
}

export function useCancelSalesOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CancelSalesOrderRequest) => salesOrdersApi.cancel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
}

export function useCompleteSalesOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => salesOrdersApi.complete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
}
