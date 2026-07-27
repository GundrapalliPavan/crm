import { IsOptional, IsUUID } from 'class-validator';
import { DateRangeQuery } from './date-range.query';

export class BillingReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
