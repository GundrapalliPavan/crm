import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelPurchaseOrderRequest, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest } from '@crm/types';
import { purchaseOrdersApi, type ListPurchaseOrdersParams } from './api';

const purchaseOrderKeys = {
  all: ['purchase-orders'] as const,
  list: (params: ListPurchaseOrdersParams) => [...purchaseOrderKeys.all, 'list', params] as const,
  detail: (id: string) => [...purchaseOrderKeys.all, 'detail', id] as const,
};

export function usePurchaseOrdersList(params: ListPurchaseOrdersParams) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => purchaseOrdersApi.list(params),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchaseOrdersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePurchaseOrderRequest) => purchaseOrdersApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePurchaseOrderRequest) => purchaseOrdersApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
}

function usePurchaseOrderAction(id: string, action: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => action(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
}

export function useSubmitPurchaseOrder(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.submit);
}

export function useApprovePurchaseOrder(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.approve);
}

export function useRejectPurchaseOrderApproval(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.rejectApproval);
}

export function useSendPurchaseOrder(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.send);
}

export function useMarkPurchaseOrderSupplierConfirmed(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.markSupplierConfirmed);
}

export function useClosePurchaseOrder(id: string) {
  return usePurchaseOrderAction(id, purchaseOrdersApi.close);
}

export function useCancelPurchaseOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CancelPurchaseOrderRequest) => purchaseOrdersApi.cancel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
}
