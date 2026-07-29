import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_DEFAULTS } from '@crm/types';

export class ListAuditLogsQuery {
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
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
