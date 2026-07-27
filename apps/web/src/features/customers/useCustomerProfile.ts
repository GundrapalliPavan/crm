import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpsertCustomerProfileRequest } from '@crm/types';
import { customerProfileApi } from './api';

const customerProfileKeys = {
  detail: (companyId: string) => ['customer-profile', companyId] as const,
};

export function useCustomerProfile(companyId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: customerProfileKeys.detail(companyId),
    queryFn: () => customerProfileApi.getByCompanyId(companyId),
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}

export function useUpsertCustomerProfile(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpsertCustomerProfileRequest) => customerProfileApi.upsert(companyId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerProfileKeys.detail(companyId) });
    },
  });
}
