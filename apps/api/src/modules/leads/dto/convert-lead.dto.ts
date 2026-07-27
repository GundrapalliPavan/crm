import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { COMPANY_TYPES, type CompanyType } from '@crm/types';

class NewCompanyDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEnum(COMPANY_TYPES, { message: `companyType must be one of: ${COMPANY_TYPES.join(', ')}` })
  companyType!: CompanyType;
}

class NewContactDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

/**
 * API.md section 42 / CRM.md sections 47-48. Supplying an id links an
 * existing record; supplying the nested object creates a new one - the
 * service still checks for a duplicate before creating either (CRM.md
 * section 47: "do not duplicate existing accounts or contacts").
 */
export class ConvertLeadDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewCompanyDto)
  company?: NewCompanyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewContactDto)
  contact?: NewContactDto;
}
