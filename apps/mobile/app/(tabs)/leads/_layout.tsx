import { Stack } from 'expo-router';

/**
 * First nested stack in the app - list -> detail -> create/edit, while the
 * bottom tab bar stays visible (Expo Router: a folder under a tab route is
 * that tab's own stack). headerShown: false matches the root layout's
 * convention of every screen building its own header inline.
 */
export default function LeadsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
