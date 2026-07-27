import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LEAD_PRIORITIES, LEAD_TYPES, type LeadPriority, type LeadType } from '@crm/types';

/**
 * CRM.md section 11 (Quick Lead Creation): only name, phone, type, source and
 * assignee are the practical minimum - everything else is optional and can be
 * enriched later ("capture first, enrich later").
 */
export class CreateLeadDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternatePhone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsEnum(LEAD_TYPES, { message: `leadType must be one of: ${LEAD_TYPES.join(', ')}` })
  leadType!: LeadType;

  @IsOptional()
  @IsEnum(LEAD_PRIORITIES, { message: `priority must be one of: ${LEAD_PRIORITIES.join(', ')}` })
  priority?: LeadPriority;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsUUID()
  assignedTeamId?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'estimatedValue must be a decimal amount.' })
  estimatedValue?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  confirmDuplicate?: boolean;
}
