import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckInFollowUpRequest, CompleteFollowUpRequest } from '@crm/types';
import { visitsApi, type ListMyTasksParams } from './api';

const visitKeys = {
  all: ['visits'] as const,
  list: (params: ListMyTasksParams) => [...visitKeys.all, 'list', params] as const,
  detail: (id: string) => [...visitKeys.all, 'detail', id] as const,
};

export function useMyTasks(params: ListMyTasksParams) {
  return useQuery({
    queryKey: visitKeys.list(params),
    queryFn: () => visitsApi.listMine(params),
  });
}

export function useFollowUp(id: string) {
  return useQuery({
    queryKey: visitKeys.detail(id),
    queryFn: () => visitsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCheckIn(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CheckInFollowUpRequest) => visitsApi.checkIn(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitKeys.all });
    },
  });
}

export function useCompleteFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CompleteFollowUpRequest) => visitsApi.complete(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitKeys.all });
    },
  });
}

export function useCancelFollowUp(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => visitsApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitKeys.all });
    },
  });
}
