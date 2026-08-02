import type { RequestPhoneChangeRequest, VerifyPhoneChangeRequest } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/**
 * The only module that calls `/auth/phone/*` directly - not routed through
 * AuthContext like changePassword/logoutAll, since a phone change does not
 * touch session state until verify-otp succeeds (see AuthContext.refreshUser).
 */
export const phoneApi = {
  async requestOtp(request: RequestPhoneChangeRequest): Promise<void> {
    await apiClient.post('/auth/phone/request-otp', request);
  },

  async verifyOtp(request: VerifyPhoneChangeRequest): Promise<void> {
    await apiClient.post('/auth/phone/verify-otp', request);
  },
};
