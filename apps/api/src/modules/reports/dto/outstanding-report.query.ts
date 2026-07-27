import { IsOptional, IsUUID } from 'class-validator';

export class OutstandingReportQuery {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
