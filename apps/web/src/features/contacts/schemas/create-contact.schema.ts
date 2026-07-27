import { z } from 'zod';

/**
 * companyId is deliberately not here - its options load asynchronously, and
 * react-hook-form's uncontrolled `register()` never observes the browser's
 * silent default-selection of the first option once that data arrives (see
 * the equivalent note in leads/schemas/create-lead.schema.ts). It is plain
 * controlled React state in ContactCreateModal instead.
 */
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'Enter a name.'),
  lastName: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
});

export type CreateContactFormValues = z.infer<typeof createContactSchema>;
