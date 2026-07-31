import { z } from 'zod';
import { LEAD_PRIORITIES, LEAD_TYPES } from '@crm/types';

/** Client-side validation only improves UX - the backend's CreateLeadDto/UpdateLeadDto are authoritative. Mirrors apps/web/src/features/leads/schemas equivalent, adapted for the mobile create/edit form. */
export const leadFormSchema = z.object({
  firstName: z.string().min(1, 'Enter a first name.').max(100, 'Keep it under 100 characters.'),
  lastName: z.string().max(100).optional().or(z.literal('')),
  companyName: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
  leadType: z.enum(LEAD_TYPES),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
