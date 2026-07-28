import { z } from 'zod';

/** managerId is a controlled Select (async-loaded user list), not registered here - see Select.tsx. */
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Enter a team name.').max(150, 'Name must be 150 characters or fewer.'),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer.').optional(),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
