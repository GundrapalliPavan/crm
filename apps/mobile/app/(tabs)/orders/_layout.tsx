import { Stack } from 'expo-router';

/** Same nested-stack pattern as leads/_layout.tsx - list -> detail/create while the bottom tab bar stays visible. */
export default function OrdersLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
