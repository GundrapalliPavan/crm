import type { SupplierProfile, UpsertSupplierProfileRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const supplierProfileApi = {
  async getByCompanyId(companyId: string): Promise<{ data: SupplierProfile | null }> {
    const { data } = await apiClient.get<{ data: SupplierProfile | null }>(
      `/companies/${companyId}/supplier-profile`,
    );
    return data;
  },

  async upsert(companyId: string, request: UpsertSupplierProfileRequest): Promise<SupplierProfile> {
    const { data } = await apiClient.patch<SupplierProfile>(
      `/companies/${companyId}/supplier-profile`,
      request,
    );
    return data;
  },
};
