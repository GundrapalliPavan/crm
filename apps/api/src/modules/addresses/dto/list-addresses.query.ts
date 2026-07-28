import { IsOptional, IsUUID } from 'class-validator';

export class ListAddressesQuery {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}
