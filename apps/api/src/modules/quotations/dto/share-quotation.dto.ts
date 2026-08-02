import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ShareQuotationRequest } from '@crm/types';

/** No `sms` - a commercial document is shared via WhatsApp or Email only. `recipient` overrides the customer/contact phone or email on file. */
export class ShareQuotationDto implements ShareQuotationRequest {
  @IsIn(['whatsapp', 'email'])
  channel!: 'whatsapp' | 'email';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipient?: string;
}
