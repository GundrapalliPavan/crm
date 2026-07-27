/**
 * Product Catalog module contracts (Module 2 - see ARCHITECTURE.md section 19,
 * DATABASE.md sections 38-45, API.md sections 49-54).
 *
 * No dedicated PRODUCT.md exists - the schema and these three docs are
 * authoritative. Product data is shared across Sales/Inventory/Purchase/
 * Billing (not built yet); those modules will read this catalog, not own a
 * copy of it.
 */

export interface CategorySummary {
  id: string;
  name: string;
}

export interface BrandSummary {
  id: string;
  name: string;
}

export interface UnitSummary {
  id: string;
  name: string;
  symbol: string;
  decimalAllowed: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  parent: CategorySummary | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryRequest {
  name: string;
  parentId?: string;
  description?: string;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  parentId?: string;
  description?: string;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
}

export interface UpdateBrandRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: CategorySummary;
  brand: BrandSummary | null;
  unit: UnitSummary;
  hsnCode: string | null;
  taxRate: string;
  purchasePriceReference: string | null;
  sellingPriceReference: string | null;
  minimumStockLevel: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  hsnCode?: string;
  taxRate?: string;
  purchasePriceReference?: string;
  sellingPriceReference?: string;
  minimumStockLevel?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest> & { isActive?: boolean };
