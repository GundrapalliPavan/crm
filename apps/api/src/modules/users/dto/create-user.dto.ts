import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * No password field: Step 4 section 39 provisions users through an
 * authorized administrator workflow, not public registration, and the server
 * generates a secure temporary password rather than trusting a client-chosen
 * one for an account someone else will hand off out-of-band.
 */
export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
