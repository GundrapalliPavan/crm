import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListNotificationsQuery } from '@crm/types';
import { notificationsApi } from './api';

const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: ListNotificationsQuery) => [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotificationsList(params: ListNotificationsQuery) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
  });
}

/** Short refetch interval keeps the Dashboard bell badge close to real-time without a push subscription. */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
