import type { ApiCollectionResponse, Contact, CreateContactRequest, UpdateContactRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListContactsParams {
  page?: number;
  pageSize?: number;
  companyId?: string;
  search?: string;
}

export const contactsApi = {
  async list(params: ListContactsParams): Promise<ApiCollectionResponse<Contact>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Contact>>('/contacts', { params });
    return data;
  },

  async getById(id: string): Promise<Contact> {
    const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
    return data;
  },

  async create(request: CreateContactRequest): Promise<Contact> {
    const { data } = await apiClient.post<Contact>('/contacts', request);
    return data;
  },

  async update(id: string, request: UpdateContactRequest): Promise<Contact> {
    const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, request);
    return data;
  },

  async archive(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  },
};
