import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsValidNewPassword } from './password-policy.validator';

export class AcceptInviteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token!: string;

  @IsValidNewPassword()
  password!: string;
}
