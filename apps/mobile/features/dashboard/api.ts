import type { DashboardResponse } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const dashboardApi = {
  async get(): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard');
    return data;
  },
};
