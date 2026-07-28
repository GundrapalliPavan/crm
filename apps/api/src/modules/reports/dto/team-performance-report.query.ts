import { IsOptional, IsUUID } from 'class-validator';
import { DateRangeQuery } from './date-range.query';

export class TeamPerformanceReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
