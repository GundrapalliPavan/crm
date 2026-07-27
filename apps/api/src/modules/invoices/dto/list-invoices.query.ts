import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { INVOICE_STATUSES, PAGINATION_DEFAULTS, type InvoiceStatus } from '@crm/types';

export class ListInvoicesQuery {
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
  @IsIn(INVOICE_STATUSES)
  status?: InvoiceStatus;

  @IsOptional()
  @IsUUID()
  customerCompanyId?: string;

  /** Matches against the invoice number. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
