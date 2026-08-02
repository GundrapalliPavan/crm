import { Redirect, router, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import { useAuth } from '@/lib/auth/useAuth';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { NotificationBell } from '@/components/NotificationBell';
import { usePushRegistration } from '@/features/notifications/usePushRegistration';

type IconName = 'house.fill' | 'person.crop.circle.fill' | 'briefcase.fill' | 'map.fill' | 'cart.fill';

function TabIcon({ name, color }: { name: IconName; color: ColorValue }) {
  return <SymbolView name={{ ios: name, android: 'circle', web: 'circle' }} tintColor={color} size={26} />;
}

/**
 * Bottom navigation (MOBILE_PRD.md section 7 - Dashboard/Leads/Visits/
 * Orders/Profile). Leads/Visits/Orders are placeholder screens in this
 * first increment (see MOBILE_ARCHITECTURE.md's phased build plan) - the
 * tab bar reflects the intended information architecture from day one
 * without pretending those modules are built yet.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { status } = useAuth();
  usePushRegistration();

  // Gate the whole tab group on authentication, mirroring apps/web's
  // ProtectedRoute - reaching any tab route while unauthenticated (a
  // dropped session, a stale deep link) bounces to the login screen.
  if (status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme].tint }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="house.fill" color={color} />,
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{ title: 'Leads', tabBarIcon: ({ color }) => <TabIcon name="briefcase.fill" color={color} /> }}
      />
      <Tabs.Screen
        name="visits"
        options={{ title: 'Visits', tabBarIcon: ({ color }) => <TabIcon name="map.fill" color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: ({ color }) => <TabIcon name="cart.fill" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person.crop.circle.fill" color={color} />,
        }}
        // Unlike Leads/Orders (where leaving a detail screen open while
        // switching tabs is useful), Profile is a settings-style tab -
        // pressing it should always land back on the summary screen, not
        // wherever its nested stack was left (e.g. Change Password).
        // React Navigation's default only pops-to-top when the tab is
        // already focused; this also resets when switching in from another
        // tab.
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.navigate('/profile');
          },
        }}
      />
      {/* Billing (MOBILE_PRD.md 7.7) - reachable only via the Dashboard's stat tiles, not
          its own bottom tab; href: null keeps it in the Tabs navigator (tab bar chrome,
          push/back) without adding a 6th tab button. */}
      <Tabs.Screen name="billing" options={{ href: null, title: 'Billing' }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
    </Tabs>
  );
}
