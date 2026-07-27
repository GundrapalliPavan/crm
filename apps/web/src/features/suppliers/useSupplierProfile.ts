import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpsertSupplierProfileRequest } from '@crm/types';
import { supplierProfileApi } from './api';

const supplierProfileKeys = {
  detail: (companyId: string) => ['supplier-profile', companyId] as const,
};

export function useSupplierProfile(companyId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: supplierProfileKeys.detail(companyId),
    queryFn: () => supplierProfileApi.getByCompanyId(companyId),
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}

export function useUpsertSupplierProfile(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpsertSupplierProfileRequest) => supplierProfileApi.upsert(companyId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierProfileKeys.detail(companyId) });
    },
  });
}
