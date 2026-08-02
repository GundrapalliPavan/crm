import { useQuery } from '@tanstack/react-query';
import { invoicesApi, type ListInvoicesParams } from './api';

const invoiceKeys = {
  all: ['invoices'] as const,
  list: (params: ListInvoicesParams) => [...invoiceKeys.all, 'list', params] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};

export function useInvoicesList(params: ListInvoicesParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoicesApi.list(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: Boolean(id),
  });
}
