import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsValidNewPassword } from './password-policy.validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token!: string;

  @IsValidNewPassword()
  newPassword!: string;
}
