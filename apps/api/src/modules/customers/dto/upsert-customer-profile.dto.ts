import { IsDateString, IsInt, IsNumberString, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class UpsertCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerCode?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'creditLimit must be a decimal amount.' })
  creditLimit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTermsDays?: number;

  @IsOptional()
  @IsDateString()
  customerSince?: string;
}
