import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddTeamMemberRequest, CreateTeamRequest, ListTeamsQuery, UpdateTeamRequest } from '@crm/types';
import { teamsApi } from './api';

const teamKeys = {
  all: ['teams'] as const,
  list: (query: ListTeamsQuery) => [...teamKeys.all, 'list', query] as const,
  detail: (id: string) => [...teamKeys.all, 'detail', id] as const,
  members: (id: string) => [...teamKeys.all, 'members', id] as const,
};

export function useTeams(query: ListTeamsQuery = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: teamKeys.list(query),
    queryFn: () => teamsApi.list(query),
    enabled: options.enabled ?? true,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTeamRequest) => teamsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateTeamRequest) => teamsApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => teamsApi.listMembers(teamId),
    enabled: Boolean(teamId),
  });
}

export function useAddTeamMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddTeamMemberRequest) => teamsApi.addMember(teamId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useRemoveTeamMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
