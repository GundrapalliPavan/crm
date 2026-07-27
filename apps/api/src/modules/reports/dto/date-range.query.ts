import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeQuery {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
