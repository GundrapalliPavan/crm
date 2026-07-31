import { Type } from 'class-transformer';
import { IsNumberString, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateFollowUpDto } from './create-follow-up.dto';

/**
 * CRM.md section 27: a lightweight "outcome + optional next follow-up" flow,
 * so completing one follow-up can schedule the next in a single request.
 * checkOutLatitude/Longitude (MOBILE_ARCHITECTURE.md section 6, Option A) are
 * only meaningful when completing a `visit`-type follow-up that was checked
 * in; the service ignores them otherwise.
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
  @IsNumberString({}, { message: 'checkOutLatitude must be a decimal number.' })
  checkOutLatitude?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'checkOutLongitude must be a decimal number.' })
  checkOutLongitude?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateFollowUpDto)
  nextFollowUp?: CreateFollowUpDto;
}
