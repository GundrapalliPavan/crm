import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompleteFollowUpRequest, CreateFollowUpRequest, UpdateFollowUpRequest } from '@crm/types';
import { followUpsApi, type ListFollowUpsParams } from './api';

const followUpKeys = {
  all: ['follow-ups'] as const,
  list: (params: ListFollowUpsParams) => [...followUpKeys.all, 'list', params] as const,
  mine: (params: Omit<ListFollowUpsParams, 'assignedTo'>) => [...followUpKeys.all, 'mine', params] as const,
};

export function useFollowUpsList(params: ListFollowUpsParams) {
  return useQuery({
    queryKey: followUpKeys.list(params),
    queryFn: () => followUpsApi.list(params),
  });
}

export function useMyFollowUps(params: Omit<ListFollowUpsParams, 'assignedTo'> = {}) {
  return useQuery({
    queryKey: followUpKeys.mine(params),
    queryFn: () => followUpsApi.listMine(params),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateFollowUpRequest) => followUpsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpKeys.all });
    },
  });
}

export function useUpdateFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateFollowUpRequest) => followUpsApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpKeys.all });
    },
  });
}

export function useCompleteFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CompleteFollowUpRequest) => followUpsApi.complete(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpKeys.all });
    },
  });
}

export function useCancelFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => followUpsApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpKeys.all });
    },
  });
}
