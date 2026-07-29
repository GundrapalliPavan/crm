import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiCollectionResponse, AssignUserRolesRequest, AuthenticatedUser, CreateUserRequest, UpdateUserStatusRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';
import { rolesApi, usersApi, type ListUsersQuery } from './api';

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

const userKeys = {
  all: ['users'] as const,
  list: (query: ListUsersQuery) => [...userKeys.all, 'list', query] as const,
};

export function useUsers(query: ListUsersQuery = {}) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.list(query),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateUserRequest) => usersApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserStatusRequest) => usersApi.updateStatus(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useAssignUserRoles(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AssignUserRolesRequest) => usersApi.assignRoles(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await rolesApi.listRoles()).data,
    staleTime: 60_000,
  });
}
