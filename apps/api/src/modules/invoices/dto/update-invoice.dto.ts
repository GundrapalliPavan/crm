import { IsDateString, IsOptional, IsString } from 'class-validator';

/** Only permitted while the invoice is `draft` (BILLING.md section 13). Items are a snapshot and are not editable here. */
export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
