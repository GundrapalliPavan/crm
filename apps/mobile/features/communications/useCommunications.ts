import { useQuery } from '@tanstack/react-query';
import { communicationsApi } from './api';

const communicationKeys = {
  all: ['communications'] as const,
  company: (companyId: string) => [...communicationKeys.all, 'company', companyId] as const,
};

export function useCompanyCommunications(companyId: string) {
  return useQuery({
    queryKey: communicationKeys.company(companyId),
    queryFn: () =>
      communicationsApi.list({ relatedEntityType: 'company', relatedEntityId: companyId, pageSize: 10 }),
    enabled: Boolean(companyId),
  });
}
