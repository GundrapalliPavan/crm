import { Prisma } from '@prisma/client';
import type {
  InventoryBalance as PrismaInventoryBalance,
  StockMovement as PrismaStockMovement,
  Product,
  ProductCategory,
  Brand,
  Warehouse,
  User,
} from '@prisma/client';
import type { InventoryBalance, StockMovement } from '@crm/types';

type ProductStockSummarySelect = Pick<Product, 'id' | 'sku' | 'name' | 'minimumStockLevel'> & {
  category: Pick<ProductCategory, 'id' | 'name'>;
  brand: Pick<Brand, 'id' | 'name'> | null;
};

const PRODUCT_STOCK_SUMMARY_SELECT = {
  id: true,
  sku: true,
  name: true,
  minimumStockLevel: true,
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
} as const;

const WAREHOUSE_SUMMARY_SELECT = { id: true, code: true, name: true } as const;

function toProductStockSummary(product: ProductStockSummarySelect) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    brand: product.brand,
    minimumStockLevel: product.minimumStockLevel?.toString() ?? null,
  };
}

export type InventoryBalanceWithRelations = PrismaInventoryBalance & {
  product: ProductStockSummarySelect;
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
};

export const INVENTORY_BALANCE_INCLUDE = {
  product: { select: PRODUCT_STOCK_SUMMARY_SELECT },
  warehouse: { select: WAREHOUSE_SUMMARY_SELECT },
} as const;

/** `availableQuantity` and `isLowStock` are derived, never stored (DATABASE.md section 50). */
export function toInventoryBalance(balance: InventoryBalanceWithRelations): InventoryBalance {
  const available = new Prisma.Decimal(balance.onHandQuantity).minus(balance.reservedQuantity);
  const minimumStockLevel = balance.product.minimumStockLevel;

  return {
    productId: balance.productId,
    warehouseId: balance.warehouseId,
    product: toProductStockSummary(balance.product),
    warehouse: balance.warehouse,
    onHandQuantity: balance.onHandQuantity.toString(),
    reservedQuantity: balance.reservedQuantity.toString(),
    availableQuantity: available.toString(),
    isLowStock: minimumStockLevel !== null && available.lessThanOrEqualTo(minimumStockLevel),
    updatedAt: balance.updatedAt.toISOString(),
  };
}

export type StockMovementWithRelations = PrismaStockMovement & {
  product: ProductStockSummarySelect;
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
  creator: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
};

export const STOCK_MOVEMENT_INCLUDE = {
  product: { select: PRODUCT_STOCK_SUMMARY_SELECT },
  warehouse: { select: WAREHOUSE_SUMMARY_SELECT },
  creator: { select: { id: true, firstName: true, lastName: true } },
} as const;

export function toStockMovement(movement: StockMovementWithRelations): StockMovement {
  return {
    id: movement.id,
    product: toProductStockSummary(movement.product),
    warehouse: movement.warehouse,
    movementType: movement.movementType,
    quantityDelta: movement.quantityDelta.toString(),
    unitCost: movement.unitCost?.toString() ?? null,
    referenceType: movement.referenceType,
    referenceId: movement.referenceId,
    movementAt: movement.movementAt.toISOString(),
    notes: movement.notes,
    createdBy: movement.creator,
    createdAt: movement.createdAt.toISOString(),
  };
}
