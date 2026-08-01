import type { ApiCollectionResponse, Company } from '@crm/types';
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
};
