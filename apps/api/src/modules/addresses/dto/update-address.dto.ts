import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ADDRESS_TYPES, type AddressType } from '@crm/types';

export class UpdateAddressDto {
  @IsOptional()
  @IsIn(ADDRESS_TYPES, { message: `addressType must be one of: ${ADDRESS_TYPES.join(', ')}` })
  addressType?: AddressType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  line1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  stateCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
