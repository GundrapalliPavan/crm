import { IsNumberString, IsUUID } from 'class-validator';

export class PaymentAllocationDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumberString({}, { message: 'amount must be a decimal amount.' })
  amount!: string;
}
