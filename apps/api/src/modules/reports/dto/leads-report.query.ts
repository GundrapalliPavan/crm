import { IsOptional, IsUUID } from 'class-validator';
import { DateRangeQuery } from './date-range.query';

export class LeadsReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
