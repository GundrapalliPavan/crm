import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS } from '@crm/types';

export class ListContactsQuery {
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
  @IsUUID()
  companyId?: string;

  /** Matches against name, phone or email. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
