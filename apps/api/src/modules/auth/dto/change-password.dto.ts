import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsValidNewPassword } from './password-policy.validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Enter your current password.' })
  @MaxLength(128)
  currentPassword!: string;

  @IsValidNewPassword()
  newPassword!: string;
}
