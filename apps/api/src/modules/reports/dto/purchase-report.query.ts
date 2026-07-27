import { IsOptional, IsUUID } from 'class-validator';
import { DateRangeQuery } from './date-range.query';

export class PurchaseReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsUUID()
  supplierCompanyId?: string;
}
