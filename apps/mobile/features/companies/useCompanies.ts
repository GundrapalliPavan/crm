import { useQuery } from '@tanstack/react-query';
import { companiesApi, type ListCompaniesParams } from './api';

const companyKeys = {
  all: ['companies'] as const,
  list: (params: ListCompaniesParams) => [...companyKeys.all, 'list', params] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
  contacts: (id: string) => [...companyKeys.all, 'contacts', id] as const,
  outstandingInvoices: (id: string) => [...companyKeys.all, 'outstanding-invoices', id] as const,
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

export function useCompanyOutstandingInvoices(id: string) {
  return useQuery({
    queryKey: companyKeys.outstandingInvoices(id),
    queryFn: () => companiesApi.getOutstandingInvoices(id),
    enabled: Boolean(id),
  });
}
