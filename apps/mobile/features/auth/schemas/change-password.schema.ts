import { z } from 'zod';

/**
 * Client-side validation only improves UX - the backend's ChangePasswordDto
 * (apps/api/src/modules/auth/dto/change-password.dto.ts,
 * IsValidNewPassword/PASSWORD_PATTERN in auth.constants.ts) is authoritative.
 * Mirrors login.schema.ts's convention.
 */
const PASSWORD_POLICY_MESSAGE = 'Password must be 10-128 characters and include at least one letter and one number.';
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z
      .string()
      .min(10, PASSWORD_POLICY_MESSAGE)
      .max(128, PASSWORD_POLICY_MESSAGE)
      .regex(PASSWORD_PATTERN, PASSWORD_POLICY_MESSAGE),
    confirmPassword: z.string().min(1, 'Re-enter your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
