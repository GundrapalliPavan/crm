import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Notification } from '@crm/types';
import { useMarkAllRead, useMarkRead, useNotificationsList } from '@/features/notifications/useNotifications';
import { notificationTypeColor, notificationTypeLabel } from '@/features/notifications/status';

/** Routes that already exist on mobile for a given relatedEntityType - anything else just marks read. */
function navigateToRelatedEntity(notification: Notification): void {
  if (!notification.relatedEntityType || !notification.relatedEntityId) return;
  const id = notification.relatedEntityId;

  switch (notification.relatedEntityType) {
    case 'lead':
      router.push({ pathname: '/leads/[id]', params: { id } });
      return;
    case 'quotation':
      router.push({ pathname: '/orders/quotations/[id]', params: { id } });
      return;
    case 'sales_order':
      router.push({ pathname: '/orders/orders/[id]', params: { id } });
      return;
    case 'company':
      router.push({ pathname: '/orders/customers/[id]', params: { id } });
      return;
    case 'invoice':
      router.push({ pathname: '/billing/invoices/[id]', params: { id } });
      return;
    case 'payment':
      router.push({ pathname: '/billing/payments/[id]', params: { id } });
      return;
    default:
      return;
  }
}

function NotificationRow({ notification }: { notification: Notification }) {
  const markRead = useMarkRead(notification.id);

  return (
    <Pressable
      style={[styles.row, !notification.isRead && styles.rowUnread]}
      onPress={() => {
        if (!notification.isRead) markRead.mutate();
        navigateToRelatedEntity(notification);
      }}
    >
      {!notification.isRead && <View style={styles.unreadDot} />}
      <View style={styles.rowMain}>
        <Text style={[styles.rowTitle, { color: notificationTypeColor(notification.type) }]}>
          {notificationTypeLabel(notification.type)}
        </Text>
        <Text style={styles.rowMessage}>{notification.title}</Text>
        <Text style={styles.rowTime}>{new Date(notification.createdAt).toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}

/** Notifications (MOBILE_PRD.md section 7.8) - reachable via the bell on the Dashboard header,
 *  not its own bottom tab (same hidden-tab mechanism as Billing). */
export default function NotificationsScreen() {
  const notifications = useNotificationsList({ pageSize: 50 });
  const markAllRead = useMarkAllRead();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{'< Dashboard'}</Text>
        </Pressable>
        <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </Pressable>
      </View>

      {notifications.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : notifications.isError || !notifications.data ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Unable to load notifications. Pull down to try again.</Text>
        </View>
      ) : notifications.data.data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyBody}>Things that need your attention will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications.data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationRow notification={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={notifications.isRefetching} onRefresh={() => void notifications.refetch()} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  back: { fontSize: 15, color: '#3b5bdb' },
  markAllRead: { fontSize: 14, fontWeight: '600', color: '#3b5bdb' },
  list: { padding: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  rowUnread: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b5bdb', marginTop: 6 },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  rowMessage: { fontSize: 14, color: '#0f172a', fontWeight: '600', marginTop: 2 },
  rowTime: { fontSize: 12, color: '#64748b', marginTop: 4 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  emptyBody: { fontSize: 13, color: '#475569', marginTop: 6, textAlign: 'center' },
});
