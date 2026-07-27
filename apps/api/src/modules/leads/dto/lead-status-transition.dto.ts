import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { LEAD_LOST_REASONS, LEAD_STATUSES, type LeadLostReason, type LeadStatus } from '@crm/types';

/**
 * API.md section 41. `lostReason` is required exactly when transitioning to
 * `lost` (CRM.md section 49: "when a lead is lost, capture a reason").
 */
export class LeadStatusTransitionDto {
  @IsEnum(LEAD_STATUSES, { message: `status must be one of: ${LEAD_STATUSES.join(', ')}` })
  status!: LeadStatus;

  @ValidateIf((dto: LeadStatusTransitionDto) => dto.status === 'lost')
  @IsEnum(LEAD_LOST_REASONS, { message: `lostReason must be one of: ${LEAD_LOST_REASONS.join(', ')}` })
  lostReason?: LeadLostReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
