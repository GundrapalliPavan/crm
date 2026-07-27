import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelInvoiceRequest, CreateInvoiceFromSalesOrderRequest, CreateInvoiceRequest, UpdateInvoiceRequest } from '@crm/types';
import { invoicesApi, type ListInvoicesParams } from './api';

const invoiceKeys = {
  all: ['invoices'] as const,
  list: (params: ListInvoicesParams) => [...invoiceKeys.all, 'list', params] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
  outstanding: (companyId: string) => ['outstanding-invoices', companyId] as const,
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

export function useOutstandingInvoices(companyId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: invoiceKeys.outstanding(companyId),
    queryFn: () => invoicesApi.listOutstandingForCompany(companyId),
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInvoiceRequest) => invoicesApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useCreateInvoiceFromSalesOrder(salesOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInvoiceFromSalesOrderRequest) =>
      invoicesApi.createFromSalesOrder(salesOrderId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateInvoiceRequest) => invoicesApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useIssueInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invoicesApi.issue(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useCancelInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CancelInvoiceRequest) => invoicesApi.cancel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
