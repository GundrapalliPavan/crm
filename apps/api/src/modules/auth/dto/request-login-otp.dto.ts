import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestLoginOtpDto {
  @IsString()
  @MinLength(6, { message: 'Enter a valid phone number.' })
  @MaxLength(20)
  phone!: string;
}
