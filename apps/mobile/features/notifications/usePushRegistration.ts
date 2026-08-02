import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { registerForPushNotificationsAsync } from './push';

/** Fires once per login/app-open (MOBILE_ARCHITECTURE.md section 9) - covers both a fresh
 *  login and a restored session, since `status` becomes 'authenticated' either way. */
export function usePushRegistration(): void {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      void registerForPushNotificationsAsync();
    }
  }, [status]);
}
