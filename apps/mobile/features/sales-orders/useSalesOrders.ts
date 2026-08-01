import { useQuery } from '@tanstack/react-query';
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
