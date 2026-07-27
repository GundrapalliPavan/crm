import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { InvoiceItemDto } from './invoice-item.dto';

/** API.md section 76 - manual billing (BILLING.md section 8), not tied to a Sales Order. */
export class CreateInvoiceDto {
  @IsUUID()
  customerCompanyId!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsDateString()
  invoiceDate!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'An invoice needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
