import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHODS, type PaymentMethod } from '@crm/types';
import { PaymentAllocationDto } from './payment-allocation.dto';

/** API.md section 81. `allocations` may sum to less than `amount` - the remainder stays unallocated (BILLING.md section 38). */
export class CreatePaymentDto {
  @IsUUID()
  customerCompanyId!: string;

  @IsDateString()
  paymentDate!: string;

  @IsNumberString({}, { message: 'amount must be a decimal amount.' })
  amount!: string;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsIn(PAYMENT_METHODS, { message: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}` })
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}
