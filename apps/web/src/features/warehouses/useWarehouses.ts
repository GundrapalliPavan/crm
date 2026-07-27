import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '@crm/types';
import { warehousesApi } from './api';

const warehouseKeys = {
  all: ['warehouses'] as const,
  detail: (id: string) => [...warehouseKeys.all, 'detail', id] as const,
};

export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.all,
    queryFn: () => warehousesApi.list(),
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehousesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateWarehouseRequest) => warehousesApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
    },
  });
}

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateWarehouseRequest) => warehousesApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
    },
  });
}
