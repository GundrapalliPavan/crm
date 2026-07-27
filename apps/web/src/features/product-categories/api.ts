import type {
  CreateProductCategoryRequest,
  ProductCategory,
  UpdateProductCategoryRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const productCategoriesApi = {
  async list(): Promise<{ data: ProductCategory[] }> {
    const { data } = await apiClient.get<{ data: ProductCategory[] }>('/product-categories');
    return data;
  },

  async create(request: CreateProductCategoryRequest): Promise<ProductCategory> {
    const { data } = await apiClient.post<ProductCategory>('/product-categories', request);
    return data;
  },

  async update(id: string, request: UpdateProductCategoryRequest): Promise<ProductCategory> {
    const { data } = await apiClient.patch<ProductCategory>(`/product-categories/${id}`, request);
    return data;
  },
};
