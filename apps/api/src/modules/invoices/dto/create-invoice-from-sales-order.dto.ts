import { IsDateString, IsOptional } from 'class-validator';

/** API.md section 77. Dates default to today / the customer's payment terms when omitted. */
export class CreateInvoiceFromSalesOrderDto {
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
