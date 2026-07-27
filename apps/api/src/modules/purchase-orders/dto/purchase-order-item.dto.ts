import { IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class PurchaseOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsNumberString({}, { message: 'orderedQuantity must be a decimal quantity.' })
  orderedQuantity!: string;

  @IsNumberString({}, { message: 'unitPrice must be a decimal amount.' })
  unitPrice!: string;

  @IsOptional()
  @IsNumberString({}, { message: 'discountPercentage must be a decimal percentage.' })
  discountPercentage?: string;
}
