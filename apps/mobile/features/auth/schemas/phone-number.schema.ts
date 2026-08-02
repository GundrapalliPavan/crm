import { z } from 'zod';

/**
 * Client-side validation only improves UX - the backend's
 * RequestPhoneChangeDto (apps/api/src/modules/auth/dto/request-phone-change.dto.ts)
 * is authoritative. Mirrors change-password.schema.ts's convention.
 */
export const phoneNumberSchema = z.object({
  newPhone: z
    .string()
    .min(6, 'Enter a valid phone number.')
    .max(20, 'Enter a valid phone number.'),
});

export type PhoneNumberFormValues = z.infer<typeof phoneNumberSchema>;
