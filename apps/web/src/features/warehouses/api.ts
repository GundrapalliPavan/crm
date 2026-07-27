import type { CreateWarehouseRequest, UpdateWarehouseRequest, Warehouse } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const warehousesApi = {
  async list(): Promise<{ data: Warehouse[] }> {
    const { data } = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
    return data;
  },

  async getById(id: string): Promise<Warehouse> {
    const { data } = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return data;
  },

  async create(request: CreateWarehouseRequest): Promise<Warehouse> {
    const { data } = await apiClient.post<Warehouse>('/warehouses', request);
    return data;
  },

  async update(id: string, request: UpdateWarehouseRequest): Promise<Warehouse> {
    const { data } = await apiClient.patch<Warehouse>(`/warehouses/${id}`, request);
    return data;
  },
};
