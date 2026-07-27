import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInventoryAdjustmentRequest, CreateInventoryTransferRequest } from '@crm/types';
import { inventoryApi, type ListInventoryParams, type ListStockMovementsParams } from './api';

const inventoryKeys = {
  all: ['inventory'] as const,
  list: (params: ListInventoryParams) => [...inventoryKeys.all, 'list', params] as const,
  product: (productId: string) => [...inventoryKeys.all, 'product', productId] as const,
  movements: (params: ListStockMovementsParams) => ['stock-movements', params] as const,
};

export function useInventoryList(params: ListInventoryParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.list(params),
  });
}

export function useProductInventory(productId: string) {
  return useQuery({
    queryKey: inventoryKeys.product(productId),
    queryFn: () => inventoryApi.getProductInventory(productId),
    enabled: Boolean(productId),
  });
}

export function useStockMovements(params: ListStockMovementsParams) {
  return useQuery({
    queryKey: inventoryKeys.movements(params),
    queryFn: () => inventoryApi.listMovements(params),
  });
}

function invalidateInventoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  void queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
}

export function useCreateInventoryAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInventoryAdjustmentRequest) => inventoryApi.createAdjustment(request),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}

export function useCreateInventoryTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInventoryTransferRequest) => inventoryApi.createTransfer(request),
    onSuccess: () => invalidateInventoryQueries(queryClient),
  });
}
