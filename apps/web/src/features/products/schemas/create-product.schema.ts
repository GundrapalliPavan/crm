import { z } from 'zod';

const decimalString = z
  .string()
  .optional()
  .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), 'Enter a valid number.');

/**
 * categoryId/brandId/unitId are deliberately not here - their options load
 * asynchronously (see the equivalent note in leads/schemas/create-lead.schema.ts)
 * and are plain controlled React state in ProductCreateModal instead.
 */
export const createProductSchema = z.object({
  sku: z.string().min(1, 'Enter a SKU.'),
  name: z.string().min(1, 'Enter a product name.'),
  hsnCode: z.string().optional(),
  taxRate: decimalString,
  sellingPriceReference: decimalString,
  purchasePriceReference: decimalString,
  minimumStockLevel: decimalString,
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
