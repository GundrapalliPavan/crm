import { useQuery } from '@tanstack/react-query';
import { catalogApi, type ListProductsParams } from './api';

const catalogKeys = {
  all: ['catalog'] as const,
  products: (params: ListProductsParams) => [...catalogKeys.all, 'products', params] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
};

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.listProducts(params),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.listCategories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => catalogApi.listBrands(),
  });
}
