import { z } from 'zod';

/**
 * Client-side validation only improves UX - the backend's
 * RequestLoginOtpDto (apps/api/src/modules/auth/dto/request-login-otp.dto.ts)
 * is authoritative. Mirrors phone-number.schema.ts's convention. The
 * 6-digit code step reuses otp.schema.ts as-is.
 */
export const loginOtpPhoneSchema = z.object({
  phone: z.string().min(6, 'Enter a valid phone number.').max(20, 'Enter a valid phone number.'),
});

export type LoginOtpPhoneFormValues = z.infer<typeof loginOtpPhoneSchema>;
