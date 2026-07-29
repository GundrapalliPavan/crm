import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * No password field: Step 4 section 39 provisions users through an
 * authorized administrator workflow, not public self-registration. The
 * invited person chooses their own password by completing
 * `POST /auth/accept-invite` from the link this create call emails them,
 * rather than the admin handing one out (see UsersService.create).
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

  /** Display handle only - login is always by email. */
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username may only contain letters, numbers, dots, underscores and hyphens.',
  })
  username!: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
