import { IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** DATABASE.md section 42-43: SKU is the stable identifier - never the product name. */
export class CreateProductDto {
  @IsString()
  @MaxLength(80)
  sku!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsUUID()
  unitId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  hsnCode?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'taxRate must be a decimal percentage.' })
  taxRate?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'purchasePriceReference must be a decimal amount.' })
  purchasePriceReference?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'sellingPriceReference must be a decimal amount.' })
  sellingPriceReference?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'minimumStockLevel must be a decimal quantity.' })
  minimumStockLevel?: string;
}
