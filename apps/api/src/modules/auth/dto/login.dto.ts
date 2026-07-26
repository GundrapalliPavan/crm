import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email!: string;

  // Intentionally not validated against the full password policy here: a
  // policy change must not lock out existing users who set a password under
  // the old rule. Only the registration/reset path enforces the policy.
  @IsString()
  @MinLength(1, { message: 'Enter your password.' })
  @MaxLength(128)
  password!: string;
}
