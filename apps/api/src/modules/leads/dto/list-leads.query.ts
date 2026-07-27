import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LEAD_PRIORITIES, LEAD_STATUSES, LEAD_TYPES, PAGINATION_DEFAULTS } from '@crm/types';
import type { LeadPriority, LeadStatus, LeadType } from '@crm/types';

/**
 * Backs the UX.md section 21 quick filters (My Leads, New, Follow-up
 * Overdue, Qualified, Unassigned, Converted) - each is just a combination of
 * these query parameters, not a separate endpoint.
 */
export class ListLeadsQuery {
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
  @IsEnum(LEAD_STATUSES)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LEAD_PRIORITIES)
  priority?: LeadPriority;

  @IsOptional()
  @IsEnum(LEAD_TYPES)
  leadType?: LeadType;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unassigned?: boolean;

  /** True: only leads with a past nextFollowUpAt that are still open. */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  overdueFollowUp?: boolean;

  @IsOptional()
  @IsDateString()
  nextFollowUpFrom?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpTo?: string;

  /** Matches against name, company name, phone or email. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
