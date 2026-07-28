import type { Address, CreateAddressRequest, ListAddressesQuery, UpdateAddressRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const addressesApi = {
  async list(query: ListAddressesQuery): Promise<{ data: Address[] }> {
    const { data } = await apiClient.get<{ data: Address[] }>('/addresses', { params: query });
    return data;
  },

  async create(payload: CreateAddressRequest): Promise<Address> {
    const { data } = await apiClient.post<Address>('/addresses', payload);
    return data;
  },

  async update(id: string, payload: UpdateAddressRequest): Promise<Address> {
    const { data } = await apiClient.patch<Address>(`/addresses/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },
};
