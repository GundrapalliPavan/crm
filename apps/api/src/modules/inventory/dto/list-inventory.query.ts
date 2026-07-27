import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS } from '@crm/types';

/** API.md section 56: GET /inventory - stock balances, filterable and searchable. */
export class ListInventoryQuery {
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
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  /** Matches against product name or SKU. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** `low` restricts results to balances at or below the product's minimumStockLevel. */
  @IsOptional()
  @IsIn(['low'])
  stockStatus?: 'low';
}
