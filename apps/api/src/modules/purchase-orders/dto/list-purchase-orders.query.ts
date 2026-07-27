import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS, PURCHASE_ORDER_STATUSES, type PurchaseOrderStatus } from '@crm/types';

export class ListPurchaseOrdersQuery {
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
  @IsIn(PURCHASE_ORDER_STATUSES)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsUUID()
  supplierCompanyId?: string;

  /** Matches against the PO number. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
