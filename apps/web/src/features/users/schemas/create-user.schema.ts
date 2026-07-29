import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'Enter a first name.').max(100, 'First name must be 100 characters or fewer.'),
  lastName: z.string().min(1, 'Enter a last name.').max(100, 'Last name must be 100 characters or fewer.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be 50 characters or fewer.')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, underscores and hyphens.'),
  email: z.string().min(1, 'Enter an email address.').email('Enter a valid email address.'),
  phone: z.string().max(20, 'Phone must be 20 characters or fewer.').optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
