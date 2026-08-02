import { Stack } from 'expo-router';

/** Same hidden-tab nested-stack pattern as billing/_layout.tsx. */
export default function NotificationsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
