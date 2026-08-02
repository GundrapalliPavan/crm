import type {
  ApiCollectionResponse,
  ListNotificationsQuery,
  Notification,
  RegisterPushTokenRequest,
  UnreadCountResponse,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** The only module that calls `/notifications*` directly - feature code goes through useNotifications.ts. */
export const notificationsApi = {
  async list(params: ListNotificationsQuery): Promise<ApiCollectionResponse<Notification>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Notification>>('/notifications', { params });
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

  async registerPushToken(request: RegisterPushTokenRequest): Promise<void> {
    await apiClient.post('/notifications/push-token', request);
  },
};
