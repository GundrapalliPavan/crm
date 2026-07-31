import type {
  ApiCollectionResponse,
  CheckInFollowUpRequest,
  CompleteFollowUpRequest,
  FollowUp,
  FollowUpStatus,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors the query params ListFollowUpsQuery accepts server-side. */
export interface ListMyTasksParams {
  status?: FollowUpStatus;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/** The only module that calls `/follow-ups*` and `/me/follow-ups` directly - feature code goes through useVisits.ts. */
export const visitsApi = {
  async listMine(params: ListMyTasksParams): Promise<ApiCollectionResponse<FollowUp>> {
    const { data } = await apiClient.get<ApiCollectionResponse<FollowUp>>('/me/follow-ups', { params });
    return data;
  },

  async getById(id: string): Promise<FollowUp> {
    const { data } = await apiClient.get<FollowUp>(`/follow-ups/${id}`);
    return data;
  },

  async checkIn(id: string, request: CheckInFollowUpRequest): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>(`/follow-ups/${id}/check-in`, request);
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
