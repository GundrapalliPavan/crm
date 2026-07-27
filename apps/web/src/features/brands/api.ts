import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const brandsApi = {
  async list(): Promise<{ data: Brand[] }> {
    const { data } = await apiClient.get<{ data: Brand[] }>('/brands');
    return data;
  },

  async create(request: CreateBrandRequest): Promise<Brand> {
    const { data } = await apiClient.post<Brand>('/brands', request);
    return data;
  },

  async update(id: string, request: UpdateBrandRequest): Promise<Brand> {
    const { data } = await apiClient.patch<Brand>(`/brands/${id}`, request);
    return data;
  },
};
