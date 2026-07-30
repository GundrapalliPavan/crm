import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Only used by a client with no cookie jar for the refresh cookie (a native mobile app) - web omits the body entirely and refreshes via the httpOnly cookie as before. */
export class RefreshDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  refreshToken?: string;
}
