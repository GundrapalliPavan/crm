import type { ApiCollectionResponse, ListNotificationsQuery, Notification, UnreadCountResponse } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const notificationsApi = {
  async list(query: ListNotificationsQuery = {}): Promise<ApiCollectionResponse<Notification>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Notification>>('/notifications', { params: query });
    return data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return data;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.post<Notification>(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
