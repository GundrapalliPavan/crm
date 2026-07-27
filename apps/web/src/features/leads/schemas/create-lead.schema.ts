import { z } from 'zod';
import { LEAD_TYPES } from '@crm/types';

/**
 * CRM.md section 11 (Quick Lead Creation): only the practical minimum -
 * everything else is enriched later, not collected up front.
 *
 * sourceId/assignedTo are deliberately not here: their options load
 * asynchronously, and react-hook-form's uncontrolled `register()` only
 * learns a field's value from a `change` event - it never observes the
 * browser's own silent default-selection of the first option once data
 * arrives, so the value RHF tracks would stay empty even though the select
 * visibly shows something chosen. They are plain controlled React state in
 * LeadCreateModal instead, which has no such gap.
 */
export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'Enter a name.'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  leadType: z.enum(LEAD_TYPES, { errorMap: () => ({ message: 'Select a lead type.' }) }),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
