import { Stack } from 'expo-router';

/** Same nested-stack pattern as orders/_layout.tsx - reachable via router.push, hidden from
 *  the tab bar via `href: null` on its Tabs.Screen entry in (tabs)/_layout.tsx. */
export default function BillingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
