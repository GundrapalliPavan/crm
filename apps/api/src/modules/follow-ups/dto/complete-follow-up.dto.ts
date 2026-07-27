import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateFollowUpDto } from './create-follow-up.dto';

/**
 * CRM.md section 27: a lightweight "outcome + optional next follow-up" flow,
 * so completing one follow-up can schedule the next in a single request.
 */
export class CompleteFollowUpDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  outcome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateFollowUpDto)
  nextFollowUp?: CreateFollowUpDto;
}
