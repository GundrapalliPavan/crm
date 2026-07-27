import type { CustomerProfile, UpsertCustomerProfileRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const customerProfileApi = {
  async getByCompanyId(companyId: string): Promise<{ data: CustomerProfile | null }> {
    const { data } = await apiClient.get<{ data: CustomerProfile | null }>(
      `/companies/${companyId}/customer-profile`,
    );
    return data;
  },

  async upsert(companyId: string, request: UpsertCustomerProfileRequest): Promise<CustomerProfile> {
    const { data } = await apiClient.patch<CustomerProfile>(
      `/companies/${companyId}/customer-profile`,
      request,
    );
    return data;
  },
};
