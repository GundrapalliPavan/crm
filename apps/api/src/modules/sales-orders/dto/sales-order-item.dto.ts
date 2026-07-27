import { IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class SalesOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsNumberString({}, { message: 'quantity must be a decimal quantity.' })
  quantity!: string;

  @IsOptional()
  @IsNumberString({}, { message: 'unitPrice must be a decimal amount.' })
  unitPrice?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'discountPercentage must be a decimal percentage.' })
  discountPercentage?: string;
}
