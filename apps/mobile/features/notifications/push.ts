import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PushPlatform } from '@crm/types';
import { notificationsApi } from './api';

/**
 * Best-effort push registration (MOBILE_ARCHITECTURE.md section 9) - called
 * once per login/app-open from usePushRegistration. Never throws and never
 * alerts the user: a denied permission, a physical-device-only restriction,
 * or a missing EAS project id (no build has been created yet) are all
 * normal, expected states, not errors worth surfacing.
 */
export async function registerForPushNotificationsAsync(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const platform: PushPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

    await notificationsApi.registerPushToken({ expoPushToken, platform });
  } catch {
    // Best-effort - see the doc comment above.
  }
}
