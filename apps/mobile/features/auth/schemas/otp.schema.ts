import { z } from 'zod';

/**
 * Client-side validation only improves UX - the backend's VerifyPhoneChangeDto
 * (PHONE_OTP_LENGTH in apps/api/src/modules/auth/auth.constants.ts) is
 * authoritative. Mirrors change-password.schema.ts's convention.
 */
export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Enter the 6-digit code.')
    .regex(/^\d+$/, 'Enter the 6-digit code.'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
