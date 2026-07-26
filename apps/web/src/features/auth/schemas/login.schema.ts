import { z } from 'zod';

/**
 * Client-side validation only improves UX - the backend's `LoginDto` is what
 * actually enforces this (FRONTEND.md section 43). Password has no complexity
 * rule here deliberately: this is a login form, not a password-creation form,
 * and a policy change must never lock out a user whose existing password
 * predates it.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
