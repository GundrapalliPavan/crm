import { z } from 'zod';

/** managerId is a controlled Select (async-loaded user list), not registered here - see Select.tsx. */
export const createWarehouseSchema = z.object({
  code: z.string().min(1, 'Enter a warehouse code.').max(20, 'Code must be 20 characters or fewer.'),
  name: z.string().min(1, 'Enter a warehouse name.'),
});

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;
