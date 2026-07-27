import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Enter a brand name.'),
  description: z.string().optional(),
});

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>;
