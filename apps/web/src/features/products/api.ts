import type { ApiCollectionResponse, CreateProductRequest, Product, UpdateProductRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

export const productsApi = {
  async list(params: ListProductsParams): Promise<ApiCollectionResponse<Product>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Product>>('/products', { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(request: CreateProductRequest): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', request);
    return data;
  },

  async update(id: string, request: UpdateProductRequest): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, request);
    return data;
  },

  async archive(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
