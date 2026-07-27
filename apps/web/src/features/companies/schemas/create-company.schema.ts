import { z } from 'zod';
import { COMPANY_TYPES } from '@crm/types';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Enter a company name.'),
  companyType: z.enum(COMPANY_TYPES, { errorMap: () => ({ message: 'Select a company type.' }) }),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
  gstin: z.string().optional(),
  isCustomer: z.boolean().optional(),
  isSupplier: z.boolean().optional(),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
