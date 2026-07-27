import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AssignLeadRequest,
  ConvertLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadRequest,
  LeadStatusTransitionRequest,
  UpdateLeadRequest,
} from '@crm/types';
import { leadsApi, type ListLeadsParams } from './api';

const leadKeys = {
  all: ['leads'] as const,
  list: (params: ListLeadsParams) => [...leadKeys.all, 'list', params] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
  activities: (id: string) => [...leadKeys.all, 'detail', id, 'activities'] as const,
};

export function useLeadsList(params: ListLeadsParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsApi.list(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useLeadActivities(id: string) {
  return useQuery({
    queryKey: leadKeys.activities(id),
    queryFn: () => leadsApi.listActivities(id),
    enabled: Boolean(id),
  });
}

/** Every mutation below invalidates the list (fields shown there may have changed) and, where
 *  applicable, the specific lead's detail/activities so the UI reflects the change immediately. */
export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLeadRequest) => leadsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateLeadRequest) => leadsApi.update(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useArchiveLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useAssignLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AssignLeadRequest) => leadsApi.assign(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
      void queryClient.invalidateQueries({ queryKey: leadKeys.activities(id) });
    },
  });
}

export function useTransitionLeadStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LeadStatusTransitionRequest) => leadsApi.transitionStatus(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
      void queryClient.invalidateQueries({ queryKey: leadKeys.activities(id) });
    },
  });
}

export function useConvertLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ConvertLeadRequest) => leadsApi.convert(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.all });
      void queryClient.invalidateQueries({ queryKey: leadKeys.activities(id) });
    },
  });
}

export function useCreateLeadActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLeadActivityRequest) => leadsApi.createActivity(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.activities(id) });
    },
  });
}
