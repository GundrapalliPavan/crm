import {
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
 * Every field optional: this is a partial update, not a resubmission of the
 * full lead (status/assignment/conversion have their own dedicated actions -
 * see AssignLeadDto, LeadStatusTransitionDto, ConvertLeadDto).
 */
export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

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

  @IsOptional()
  @IsEnum(LEAD_TYPES, { message: `leadType must be one of: ${LEAD_TYPES.join(', ')}` })
  leadType?: LeadType;

  @IsOptional()
  @IsEnum(LEAD_PRIORITIES, { message: `priority must be one of: ${LEAD_PRIORITIES.join(', ')}` })
  priority?: LeadPriority;

  @IsOptional()
  @IsNumberString({}, { message: 'estimatedValue must be a decimal amount.' })
  estimatedValue?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;
}
