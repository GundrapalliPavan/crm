import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LEAD_ACTIVITY_TYPES, type LeadActivityType } from '@crm/types';

/**
 * Manual activity logging only (CRM.md section 29: Call, Meeting, Note).
 * `created`, `assigned`, `status_changed` and `converted` are system-generated
 * by their respective actions and cannot be posted here.
 */
const MANUAL_ACTIVITY_TYPES = LEAD_ACTIVITY_TYPES.filter(
  (type): type is 'call' | 'meeting' | 'note' | 'follow_up' =>
    type === 'call' || type === 'meeting' || type === 'note' || type === 'follow_up',
);

export class CreateLeadActivityDto {
  @IsEnum(MANUAL_ACTIVITY_TYPES, {
    message: `activityType must be one of: ${MANUAL_ACTIVITY_TYPES.join(', ')}`,
  })
  activityType!: LeadActivityType;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  activityAt?: string;
}
