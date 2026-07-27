import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { COMPANY_TYPES, PAGINATION_DEFAULTS, type CompanyType } from '@crm/types';

/** API.md section 47 filters: ?type=dealer, ?isCustomer=true, ?isSupplier=true. */
export class ListCompaniesQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = PAGINATION_DEFAULTS.page;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_DEFAULTS.maxPageSize)
  pageSize: number = PAGINATION_DEFAULTS.pageSize;

  @IsOptional()
  @IsEnum(COMPANY_TYPES)
  type?: CompanyType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCustomer?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSupplier?: boolean;

  /** Matches against name, GSTIN or phone. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
