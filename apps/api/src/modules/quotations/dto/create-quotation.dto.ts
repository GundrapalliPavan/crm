import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { QuotationItemDto } from './quotation-item.dto';

/** API.md section 63. */
export class CreateQuotationDto {
  @IsUUID()
  customerCompanyId!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsDateString()
  quotationDate!: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'A quotation needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
