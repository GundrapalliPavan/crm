import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { COMPANY_TYPES, type CompanyType } from '@crm/types';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEnum(COMPANY_TYPES, { message: `companyType must be one of: ${COMPANY_TYPES.join(', ')}` })
  companyType!: CompanyType;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxIdentifier?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}$/, { message: 'stateCode must be a 2-digit GST state code, e.g. "36".' })
  stateCode?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'creditLimit must be a decimal amount.' })
  creditLimit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  paymentTermsDays?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCustomer?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSupplier?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  confirmDuplicate?: boolean;
}
