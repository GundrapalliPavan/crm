import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS, SALES_ORDER_STATUSES, type SalesOrderStatus } from '@crm/types';

export class ListSalesOrdersQuery {
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
  @IsIn(SALES_ORDER_STATUSES)
  status?: SalesOrderStatus;

  @IsOptional()
  @IsUUID()
  customerCompanyId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  /** Matches against the sales order number. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
