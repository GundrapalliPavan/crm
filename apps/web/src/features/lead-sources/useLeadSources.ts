import { useQuery } from '@tanstack/react-query';
import type { LeadSourceSummary } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export function useLeadSources() {
  return useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LeadSourceSummary[] }>('/lead-sources');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}
