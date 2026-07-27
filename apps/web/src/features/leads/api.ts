import type {
  ApiCollectionResponse,
  AssignLeadRequest,
  ConvertLeadRequest,
  CreateLeadActivityRequest,
  CreateLeadRequest,
  Lead,
  LeadActivity,
  LeadPriority,
  LeadStatus,
  LeadType,
  LeadStatusTransitionRequest,
  UpdateLeadRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListLeadsParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus;
  priority?: LeadPriority;
  leadType?: LeadType;
  assignedTo?: string;
  sourceId?: string;
  unassigned?: boolean;
  overdueFollowUp?: boolean;
  search?: string;
}

/**
 * The only module that calls `/leads*` directly (FRONTEND.md section 33 -
 * organised by domain). Feature components read/write leads through the
 * `useLeads` hooks instead of importing this directly.
 */
export const leadsApi = {
  async list(params: ListLeadsParams): Promise<ApiCollectionResponse<Lead>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Lead>>('/leads', { params });
    return data;
  },

  async getById(id: string): Promise<Lead> {
    const { data } = await apiClient.get<Lead>(`/leads/${id}`);
    return data;
  },

  async create(request: CreateLeadRequest): Promise<Lead> {
    const { data } = await apiClient.post<Lead>('/leads', request);
    return data;
  },

  async update(id: string, request: UpdateLeadRequest): Promise<Lead> {
    const { data } = await apiClient.patch<Lead>(`/leads/${id}`, request);
    return data;
  },

  async archive(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  },

  async assign(id: string, request: AssignLeadRequest): Promise<Lead> {
    const { data } = await apiClient.post<Lead>(`/leads/${id}/assign`, request);
    return data;
  },

  async transitionStatus(id: string, request: LeadStatusTransitionRequest): Promise<Lead> {
    const { data } = await apiClient.post<Lead>(`/leads/${id}/status`, request);
    return data;
  },

  async convert(id: string, request: ConvertLeadRequest): Promise<Lead> {
    const { data } = await apiClient.post<Lead>(`/leads/${id}/convert`, request);
    return data;
  },

  async listActivities(id: string): Promise<{ data: LeadActivity[] }> {
    const { data } = await apiClient.get<{ data: LeadActivity[] }>(`/leads/${id}/activities`);
    return data;
  },

  async createActivity(id: string, request: CreateLeadActivityRequest): Promise<LeadActivity> {
    const { data } = await apiClient.post<LeadActivity>(`/leads/${id}/activities`, request);
    return data;
  },
};
