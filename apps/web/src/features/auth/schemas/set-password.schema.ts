import { z } from 'zod';

/**
 * Shared by reset-password and accept-invite - both are "choose a new
 * password" forms. Mirrors the backend's policy (auth.constants.ts) for
 * immediate feedback; the backend remains authoritative.
 */
export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Password must be 10-128 characters and include at least one letter and one number.')
      .max(128, 'Password must be 10-128 characters and include at least one letter and one number.')
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must be 10-128 characters and include at least one letter and one number.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
