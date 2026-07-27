import { IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** API.md section 60. Moves stock from one warehouse to another as a paired movement. */
export class CreateInventoryTransferDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  fromWarehouseId!: string;

  @IsUUID()
  toWarehouseId!: string;

  @IsNumberString({}, { message: 'quantity must be a positive decimal quantity.' })
  quantity!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
