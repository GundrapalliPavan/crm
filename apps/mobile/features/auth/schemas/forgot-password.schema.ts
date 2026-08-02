import { z } from 'zod';

/** Client-side validation only improves UX - the backend's ForgotPasswordDto is authoritative. Mirrors apps/web/src/features/auth/schemas/forgot-password.schema.ts. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
