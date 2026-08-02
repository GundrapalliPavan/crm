import type { ApiCollectionResponse, Company, Contact, OutstandingInvoice } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors ListCompaniesQuery on the server - mobile only needs the customer picker for now. */
export interface ListCompaniesParams {
  search?: string;
  isCustomer?: boolean;
  pageSize?: number;
}

/** Read-only: mobile has no company create-or-edit UI yet. */
export const companiesApi = {
  async list(params: ListCompaniesParams): Promise<ApiCollectionResponse<Company>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Company>>('/companies', { params });
    return data;
  },

  async getById(id: string): Promise<Company> {
    const { data } = await apiClient.get<Company>(`/companies/${id}`);
    return data;
  },

  async listContacts(id: string): Promise<ApiCollectionResponse<Contact>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Contact>>(`/companies/${id}/contacts`, {
      params: { pageSize: 50 },
    });
    return data;
  },

  async getOutstandingInvoices(id: string): Promise<{ data: OutstandingInvoice[] }> {
    const { data } = await apiClient.get<{ data: OutstandingInvoice[] }>(`/companies/${id}/outstanding-invoices`);
    return data;
  },
};
