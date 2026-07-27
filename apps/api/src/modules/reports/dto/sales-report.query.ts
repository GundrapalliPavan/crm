import { IsOptional, IsUUID } from 'class-validator';
import { DateRangeQuery } from './date-range.query';

export class SalesReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
