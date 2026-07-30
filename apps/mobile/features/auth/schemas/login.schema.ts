import { z } from 'zod';

/** Client-side validation only improves UX - the backend's LoginDto is authoritative. Mirrors apps/web/src/features/auth/schemas/login.schema.ts. */
export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
