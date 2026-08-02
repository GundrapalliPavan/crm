import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth/useAuth';

/** MOBILE_PRD.md section 7.9 - User Profile, Change Password, Logout (+ log out of all devices). */
export default function ProfileScreen() {
  const { user, logout, logoutAll } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

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

  async function handleLogoutAll() {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
    } finally {
      setIsLoggingOutAll(false);
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

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Designation</Text>
              <Text style={styles.infoValue}>{user?.roles[0]?.name ?? '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>{user?.team?.name ?? '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.section}>
          <Pressable style={styles.row} onPress={() => router.push('/profile/change-password')}>
            <Text style={styles.rowText}>Change Password</Text>
            <Text style={styles.rowChevron}>{'>'}</Text>
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={() => router.push('/profile/phone-number')}>
            <View>
              <Text style={styles.rowText}>Phone Number</Text>
              <Text style={styles.rowSubtext}>{user?.phone ?? 'Not set'}</Text>
            </View>
            <Text style={styles.rowChevron}>{'>'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
          onPress={() => void handleLogout()}
          disabled={isLoggingOut || isLoggingOutAll}
        >
          {isLoggingOut ? <ActivityIndicator color="#b91c1c" /> : <Text style={styles.logoutText}>Sign out</Text>}
        </Pressable>

        <Pressable
          style={[styles.logoutAllButton, isLoggingOutAll && styles.buttonDisabled]}
          onPress={() => void handleLogoutAll()}
          disabled={isLoggingOut || isLoggingOutAll}
        >
          {isLoggingOutAll ? (
            <ActivityIndicator color="#64748b" />
          ) : (
            <Text style={styles.logoutAllText}>Log out of all devices</Text>
          )}
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
    marginBottom: 20,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 14, color: '#475569', marginTop: 2 },
  meta: { fontSize: 13, color: '#64748b', marginTop: 6 },
  infoGrid: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 24,
  },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: { height: 1, backgroundColor: '#f1f5f9' },
  rowText: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  rowChevron: { fontSize: 15, color: '#94a3b8' },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutAllButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.7 },
  logoutText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
  logoutAllText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
});
