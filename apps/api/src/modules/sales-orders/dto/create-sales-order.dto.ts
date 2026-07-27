import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { SalesOrderItemDto } from './sales-order-item.dto';

/** API.md section 66. */
export class CreateSalesOrderDto {
  @IsUUID()
  customerCompanyId!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsDateString()
  orderDate!: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'A sales order needs at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items!: SalesOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
