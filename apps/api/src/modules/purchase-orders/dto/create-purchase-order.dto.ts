import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PurchaseOrderItemDto } from './purchase-order-item.dto';

/** API.md section 71. */
export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierCompanyId!: string;

  @IsDateString()
  poDate!: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'A purchase order needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
