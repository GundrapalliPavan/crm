import type { ApiCollectionResponse, Brand, Product, ProductCategory } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors ListProductsQuery on the server - only the filters the mobile line-item picker needs. */
export interface ListProductsParams {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  pageSize?: number;
}

/** Read-only: mobile has no product/category/brand create-or-edit UI (CLAUDE.md section 6 scope discipline). */
export const catalogApi = {
  async listProducts(params: ListProductsParams): Promise<ApiCollectionResponse<Product>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Product>>('/products', { params });
    return data;
  },

  async listCategories(): Promise<{ data: ProductCategory[] }> {
    const { data } = await apiClient.get<{ data: ProductCategory[] }>('/product-categories');
    return data;
  },

  async listBrands(): Promise<{ data: Brand[] }> {
    const { data } = await apiClient.get<{ data: Brand[] }>('/brands');
    return data;
  },
};
