import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** CRM.md section 57 - a contact need not belong to a company ("Independent Contacts"). */
export class CreateContactDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternatePhone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  confirmDuplicate?: boolean;
}
