import { IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Exactly one of `productId` / `customProductName` must be set - enforced in
 * QuotationsService.resolveItems, not here, since class-validator's
 * conditional decorators don't express "exactly one of" cleanly. A
 * `customProductName` line is an ad-hoc item with no catalog product
 * (SALES.md - mobile Field Sales Executive scope): it still requires an
 * explicit `unitPrice` since there is no product to default one from, and its
 * tax rate is always 0%.
 */
export class QuotationItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  customProductName?: string;

  @IsNumberString({}, { message: 'quantity must be a decimal quantity.' })
  quantity!: string;

  @IsOptional()
  @IsNumberString({}, { message: 'unitPrice must be a decimal amount.' })
  unitPrice?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'discountPercentage must be a decimal percentage.' })
  discountPercentage?: string;
}
