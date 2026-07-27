import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS, PAYMENT_STATUSES, type PaymentStatus } from '@crm/types';

export class ListPaymentsQuery {
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
  @IsIn(PAYMENT_STATUSES)
  status?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  customerCompanyId?: string;

  /** Matches against the payment number. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
