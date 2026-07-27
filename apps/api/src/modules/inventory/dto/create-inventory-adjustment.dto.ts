import { IsIn, IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { STOCK_ADJUSTMENT_REASONS, type StockAdjustmentReason } from '@crm/types';

/** API.md section 59 / INVENTORY.md sections 41-42. `quantityDelta` may be negative. */
export class CreateInventoryAdjustmentDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsNumberString({}, { message: 'quantityDelta must be a decimal quantity.' })
  quantityDelta!: string;

  @IsIn(STOCK_ADJUSTMENT_REASONS)
  reason!: StockAdjustmentReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
