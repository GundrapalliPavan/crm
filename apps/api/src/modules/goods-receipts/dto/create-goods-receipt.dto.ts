import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { GoodsReceiptItemDto } from './goods-receipt-item.dto';

/** API.md section 73. */
export class CreateGoodsReceiptDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsDateString()
  receiptDate!: string;

  @IsOptional()
  @IsString()
  supplierDocumentNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'A goods receipt needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items!: GoodsReceiptItemDto[];
}
