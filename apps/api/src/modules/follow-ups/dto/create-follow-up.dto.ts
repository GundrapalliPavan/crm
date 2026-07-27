import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { FOLLOW_UP_TYPES, type FollowUpType } from '@crm/types';

/** DATABASE.md section 29: at least one of leadId/contactId/companyId must be set - enforced in the service. */
export class CreateFollowUpDto {
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsUUID()
  assignedTo!: string;

  @IsEnum(FOLLOW_UP_TYPES, { message: `followUpType must be one of: ${FOLLOW_UP_TYPES.join(', ')}` })
  followUpType!: FollowUpType;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
