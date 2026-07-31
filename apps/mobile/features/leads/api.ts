import type {
  ApiCollectionResponse,
  ConvertLeadRequest,
  CreateFollowUpRequest,
  CreateLeadActivityRequest,
  CreateLeadRequest,
  FollowUp,
  Lead,
  LeadActivity,
  LeadPriority,
  LeadStatus,
  LeadType,
  LeadStatusTransitionRequest,
  UpdateLeadRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors apps/web/src/features/leads/api.ts's ListLeadsParams exactly - same query contract. */
export interface ListLeadsParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus;
  priority?: LeadPriority;
  leadType?: LeadType;
  assignedTo?: string;
  search?: string;
}

/** The only module that calls `/leads*` directly - feature code goes through useLeads.ts. */
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

  /** Schedules a follow-up (optionally a site visit) against this lead - reuses /follow-ups as-is. */
  async createFollowUp(request: CreateFollowUpRequest): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>('/follow-ups', request);
    return data;
  },
};
