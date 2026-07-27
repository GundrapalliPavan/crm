/**
 * Inventory module contracts (Module 3 - see INVENTORY.md section 116,
 * DATABASE.md sections 46-53, API.md sections 55-61).
 *
 * Scope for this pass is the Inventory Foundation tier (Warehouses, Stock
 * Balances, Stock Movement Ledger, Basic Stock Search) plus Adjustments and
 * Transfers - both self-contained and already backed by schema movement
 * types and seeded permissions. Receiving, Sales Allocation, Fulfilment,
 * Stock Count/Reconciliation, Serial/Batch tracking and Inventory
 * Intelligence (ageing/forecasting/analytics) are deferred: most depend on
 * the Sales/Purchase modules, which do not exist yet.
 */

import type { UserSummary } from './crm';
import type { BrandSummary, CategorySummary } from './product';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  manager: UserSummary | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  managerId?: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  managerId?: string | null;
  isActive?: boolean;
}

export interface WarehouseSummary {
  id: string;
  code: string;
  name: string;
}

export interface ProductStockSummary {
  id: string;
  sku: string;
  name: string;
  category: CategorySummary;
  brand: BrandSummary | null;
  minimumStockLevel: string | null;
}

/**
 * A product's stock position in one warehouse. `availableQuantity` is
 * derived (onHand - reserved), never stored (DATABASE.md section 50).
 */
export interface InventoryBalance {
  productId: string;
  warehouseId: string;
  product: ProductStockSummary;
  warehouse: WarehouseSummary;
  onHandQuantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  isLowStock: boolean;
  updatedAt: string;
}

export const STOCK_MOVEMENT_TYPES = [
  'opening',
  'purchase_receipt',
  'sales_issue',
  'sales_return',
  'purchase_return',
  'adjustment_in',
  'adjustment_out',
  'transfer_in',
  'transfer_out',
  'reservation',
  'reservation_release',
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export const STOCK_REFERENCE_TYPES = [
  'goods_receipt',
  'sales_order',
  'invoice',
  'adjustment',
  'transfer',
  'opening_balance',
] as const;
export type StockReferenceType = (typeof STOCK_REFERENCE_TYPES)[number];

export interface StockMovement {
  id: string;
  product: ProductStockSummary;
  warehouse: WarehouseSummary;
  movementType: StockMovementType;
  quantityDelta: string;
  unitCost: string | null;
  referenceType: StockReferenceType | null;
  referenceId: string | null;
  movementAt: string;
  notes: string | null;
  createdBy: UserSummary | null;
  createdAt: string;
}

export const STOCK_ADJUSTMENT_REASONS = [
  'physical_count_difference',
  'damage',
  'breakage',
  'lost_stock',
  'data_correction',
  'opening_balance_correction',
  'other',
] as const;
export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

/** POST /inventory/adjustments (INVENTORY.md sections 41-42). `quantityDelta` may be negative. */
export interface CreateInventoryAdjustmentRequest {
  productId: string;
  warehouseId: string;
  quantityDelta: string;
  reason: StockAdjustmentReason;
  notes?: string;
}

/** POST /inventory/transfers - moves stock between two warehouses as a paired movement. */
export interface CreateInventoryTransferRequest {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: string;
  notes?: string;
}
