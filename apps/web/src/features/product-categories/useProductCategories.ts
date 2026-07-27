import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateProductCategoryRequest, UpdateProductCategoryRequest } from '@crm/types';
import { productCategoriesApi } from './api';

const categoryKeys = { all: ['product-categories'] as const };

export function useProductCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => productCategoriesApi.list(),
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProductCategoryRequest) => productCategoriesApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateProductCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateProductCategoryRequest) => productCategoriesApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
