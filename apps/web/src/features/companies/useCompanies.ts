import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '@crm/types';
import { companiesApi, type ListCompaniesParams } from './api';

const companyKeys = {
  all: ['companies'] as const,
  list: (params: ListCompaniesParams) => [...companyKeys.all, 'list', params] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
  contacts: (id: string) => [...companyKeys.all, 'detail', id, 'contacts'] as const,
};

export function useCompaniesList(params: ListCompaniesParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesApi.list(params),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCompanyContacts(id: string) {
  return useQuery({
    queryKey: companyKeys.contacts(id),
    queryFn: () => companiesApi.listContacts(id),
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCompanyRequest) => companiesApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCompanyRequest) => companiesApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useArchiveCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}
