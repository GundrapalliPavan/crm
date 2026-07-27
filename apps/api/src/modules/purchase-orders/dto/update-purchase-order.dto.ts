import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PurchaseOrderItemDto } from './purchase-order-item.dto';

/** Only permitted while the PO is still `draft` (PURCHASE.md section 43). */
export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsUUID()
  supplierCompanyId?: string;

  @IsOptional()
  @IsDateString()
  poDate?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'A purchase order needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
