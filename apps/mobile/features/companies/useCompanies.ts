import { useQuery } from '@tanstack/react-query';
import { companiesApi, type ListCompaniesParams } from './api';

const companyKeys = {
  all: ['companies'] as const,
  list: (params: ListCompaniesParams) => [...companyKeys.all, 'list', params] as const,
};

export function useCompaniesList(params: ListCompaniesParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesApi.list(params),
  });
}
