import { IsString, Length, MaxLength, MinLength } from 'class-validator';
import { LOGIN_OTP_LENGTH } from '../auth.constants';

export class VerifyLoginOtpDto {
  @IsString()
  @MinLength(6, { message: 'Enter a valid phone number.' })
  @MaxLength(20)
  phone!: string;

  @IsString()
  @Length(LOGIN_OTP_LENGTH, LOGIN_OTP_LENGTH, { message: 'Enter the 6-digit code.' })
  code!: string;
}
