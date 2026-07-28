import { z } from 'zod';
import { ADDRESS_TYPES } from '@crm/types';

/** addressType and isDefault are controlled inputs (Select/checkbox), not registered here. */
export const addressSchema = z.object({
  line1: z.string().min(1, 'Enter the address line.').max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1, 'Enter a city.').max(100),
  state: z.string().min(1, 'Enter a state.').max(100),
  stateCode: z.string().max(2).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().max(2).optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const ADDRESS_TYPE_OPTIONS = ADDRESS_TYPES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));
