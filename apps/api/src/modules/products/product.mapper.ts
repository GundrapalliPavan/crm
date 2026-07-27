import type { Product as PrismaProduct, ProductCategory, Brand, Unit } from '@prisma/client';
import type { Product } from '@crm/types';

export type ProductWithRelations = PrismaProduct & {
  category: Pick<ProductCategory, 'id' | 'name'>;
  brand: Pick<Brand, 'id' | 'name'> | null;
  unit: Pick<Unit, 'id' | 'name' | 'symbol' | 'decimalAllowed'>;
};

export const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true, symbol: true, decimalAllowed: true } },
} as const;

export function toProduct(product: ProductWithRelations): Product {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    unit: product.unit,
    hsnCode: product.hsnCode,
    taxRate: product.taxRate.toString(),
    purchasePriceReference: product.purchasePriceReference?.toString() ?? null,
    sellingPriceReference: product.sellingPriceReference?.toString() ?? null,
    minimumStockLevel: product.minimumStockLevel?.toString() ?? null,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
