import { Stack } from 'expo-router';

/** Same nested-stack pattern as leads/_layout.tsx - list -> detail while the bottom tab bar stays visible. */
export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
