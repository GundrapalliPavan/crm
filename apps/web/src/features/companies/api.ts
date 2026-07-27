import type {
  ApiCollectionResponse,
  Company,
  CompanyType,
  Contact,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListCompaniesParams {
  page?: number;
  pageSize?: number;
  type?: CompanyType;
  isCustomer?: boolean;
  isSupplier?: boolean;
  search?: string;
}

export const companiesApi = {
  async list(params: ListCompaniesParams): Promise<ApiCollectionResponse<Company>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Company>>('/companies', { params });
    return data;
  },

  async getById(id: string): Promise<Company> {
    const { data } = await apiClient.get<Company>(`/companies/${id}`);
    return data;
  },

  async listContacts(id: string, page = 1, pageSize = 25): Promise<ApiCollectionResponse<Contact>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Contact>>(`/companies/${id}/contacts`, {
      params: { page, pageSize },
    });
    return data;
  },

  async create(request: CreateCompanyRequest): Promise<Company> {
    const { data } = await apiClient.post<Company>('/companies', request);
    return data;
  },

  async update(id: string, request: UpdateCompanyRequest): Promise<Company> {
    const { data } = await apiClient.patch<Company>(`/companies/${id}`, request);
    return data;
  },

  async archive(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  },
};
