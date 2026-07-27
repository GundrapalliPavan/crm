import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBrandRequest, UpdateBrandRequest } from '@crm/types';
import { brandsApi } from './api';

const brandKeys = { all: ['brands'] as const };

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: () => brandsApi.list(),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateBrandRequest) => brandsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

export function useUpdateBrand(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateBrandRequest) => brandsApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}
