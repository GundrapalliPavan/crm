import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth/useAuth';

/** MOBILE_PRD.md section 7.9 - User Profile, Change Password (later increment), Logout. */
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      // TabLayout redirects to /login once status flips to 'unauthenticated' -
      // no manual navigation needed here.
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.username && <Text style={styles.meta}>@{user.username}</Text>}
          {user && user.roles.length > 0 && (
            <Text style={styles.meta}>{user.roles.map((role) => role.name).join(', ')}</Text>
          )}
        </View>

        <Pressable
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <ActivityIndicator color="#b91c1c" /> : <Text style={styles.logoutText}>Sign out</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 24,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 14, color: '#475569', marginTop: 2 },
  meta: { fontSize: 13, color: '#64748b', marginTop: 6 },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonDisabled: { opacity: 0.7 },
  logoutText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
});
