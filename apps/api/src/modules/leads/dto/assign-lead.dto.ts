import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

/** API.md section 40. At least one of userId/teamId must be present. */
export class AssignLeadDto {
  @ValidateIf((dto: AssignLeadDto) => !dto.teamId)
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;
}
