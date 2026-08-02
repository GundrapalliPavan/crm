import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUnreadCount } from '@/features/notifications/useNotifications';

/** Dashboard header button (MOBILE_PRD.md section 7.8) - mirrors web's NotificationBell in
 *  the TopBar. Notifications has no bottom tab of its own; this is the only entry point. */
export function NotificationBell() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Pressable style={styles.button} onPress={() => router.push('/notifications')}>
      <SymbolView name={{ ios: 'bell.fill', android: 'circle', web: 'circle' }} tintColor="#0f172a" size={22} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 16, position: 'relative' },
  badge: {
    position: 'absolute',
    top: -2,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
});
