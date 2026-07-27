import { useQuery } from '@tanstack/react-query';
import type { ApiCollectionResponse, AuthenticatedUser } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/**
 * A simple assignment picker (Lead/Company/Contact owner selects). One page
 * of up to 100 users is enough for this pass - a searchable picker belongs
 * to a later polish pass if the user list outgrows a single page.
 */
export function useAssignableUsers() {
  return useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiCollectionResponse<AuthenticatedUser>>('/users', {
        params: { page: 1, pageSize: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
