import { useQuery } from '@tanstack/react-query';
import type { UnitSummary } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: UnitSummary[] }>('/units');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}
