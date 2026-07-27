import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { FOLLOW_UP_TYPES, type FollowUpType } from '@crm/types';

/** The lead/contact/company relationship a follow-up belongs to is fixed at creation. */
export class UpdateFollowUpDto {
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(FOLLOW_UP_TYPES, { message: `followUpType must be one of: ${FOLLOW_UP_TYPES.join(', ')}` })
  followUpType?: FollowUpType;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
