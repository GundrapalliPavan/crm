import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class GoodsReceiptItemDto {
  @IsUUID()
  purchaseOrderItemId!: string;

  @IsNumberString({}, { message: 'quantityReceived must be a decimal quantity.' })
  quantityReceived!: string;

  /** Defaults to 0 - only the accepted portion (quantityReceived - rejectedQuantity) is added to stock. */
  @IsOptional()
  @IsNumberString({}, { message: 'rejectedQuantity must be a decimal quantity.' })
  rejectedQuantity?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
