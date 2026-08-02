import { IsString, Length } from 'class-validator';
import { PHONE_OTP_LENGTH } from '../auth.constants';

export class VerifyPhoneChangeDto {
  @IsString()
  @Length(PHONE_OTP_LENGTH, PHONE_OTP_LENGTH, { message: 'Enter the 6-digit code.' })
  code!: string;
}
