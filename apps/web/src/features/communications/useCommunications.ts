import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateCommunicationRequest,
  CreateCommunicationTemplateRequest,
  UpdateCommunicationTemplateRequest,
} from '@crm/types';
import { communicationsApi, type ListCommunicationsParams, type ListCommunicationTemplatesParams } from './api';

const communicationKeys = {
  all: ['communications'] as const,
  list: (params: ListCommunicationsParams) => [...communicationKeys.all, 'list', params] as const,
};

const templateKeys = {
  all: ['communication-templates'] as const,
  list: (params: ListCommunicationTemplatesParams) => [...templateKeys.all, 'list', params] as const,
};

export function useCommunicationsList(params: ListCommunicationsParams) {
  return useQuery({
    queryKey: communicationKeys.list(params),
    queryFn: () => communicationsApi.list(params),
  });
}

export function useCreateCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCommunicationRequest) => communicationsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

export function useCommunicationTemplatesList(params: ListCommunicationTemplatesParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => communicationsApi.listTemplates(params),
  });
}

export function useCreateCommunicationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCommunicationTemplateRequest) => communicationsApi.createTemplate(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

export function useUpdateCommunicationTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCommunicationTemplateRequest) => communicationsApi.updateTemplate(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}
