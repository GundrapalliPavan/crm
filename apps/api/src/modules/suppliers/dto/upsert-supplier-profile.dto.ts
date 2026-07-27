import { IsDateString, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class UpsertSupplierProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTermsDays?: number;

  @IsOptional()
  @IsDateString()
  supplierSince?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
