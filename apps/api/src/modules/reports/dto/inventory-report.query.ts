import { IsOptional, IsUUID } from 'class-validator';

/** Point-in-time snapshot - no date range (REPORTS.md section 44). */
export class InventoryReportQuery {
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;
}
