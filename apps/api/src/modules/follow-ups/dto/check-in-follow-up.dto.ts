import { IsNumberString, IsOptional } from 'class-validator';

/** MOBILE_ARCHITECTURE.md section 6, Option A - check-in on a `visit`-type follow-up. GPS is optional (may be unavailable/denied on device). Decimal wire values are strings, matching every other Decimal-backed DTO field in this module. */
export class CheckInFollowUpDto {
  @IsOptional()
  @IsNumberString({}, { message: 'latitude must be a decimal number.' })
  latitude?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'longitude must be a decimal number.' })
  longitude?: string;
}
