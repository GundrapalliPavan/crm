import type {
  ApiCollectionResponse,
  CompleteFollowUpRequest,
  CreateFollowUpRequest,
  FollowUp,
  FollowUpStatus,
  UpdateFollowUpRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListFollowUpsParams {
  page?: number;
  pageSize?: number;
  status?: FollowUpStatus;
  leadId?: string;
  contactId?: string;
  companyId?: string;
  assignedTo?: string;
  overdue?: boolean;
}

export const followUpsApi = {
  async list(params: ListFollowUpsParams): Promise<ApiCollectionResponse<FollowUp>> {
    const { data } = await apiClient.get<ApiCollectionResponse<FollowUp>>('/follow-ups', { params });
    return data;
  },

  async listMine(params: Omit<ListFollowUpsParams, 'assignedTo'>): Promise<ApiCollectionResponse<FollowUp>> {
    const { data } = await apiClient.get<ApiCollectionResponse<FollowUp>>('/me/follow-ups', { params });
    return data;
  },

  async create(request: CreateFollowUpRequest): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>('/follow-ups', request);
    return data;
  },

  async update(id: string, request: UpdateFollowUpRequest): Promise<FollowUp> {
    const { data } = await apiClient.patch<FollowUp>(`/follow-ups/${id}`, request);
    return data;
  },

  async complete(id: string, request: CompleteFollowUpRequest): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>(`/follow-ups/${id}/complete`, request);
    return data;
  },

  async cancel(id: string): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>(`/follow-ups/${id}/cancel`);
    return data;
  },
};
