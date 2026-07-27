import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { COMMUNICATION_CHANNELS, TEMPLATE_STATUSES, type CommunicationChannel, type TemplateStatus } from '@crm/types';

export class UpdateCommunicationTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsIn(COMMUNICATION_CHANNELS)
  channel?: CommunicationChannel;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  purpose?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subjectTemplate?: string;

  @IsOptional()
  @IsString()
  bodyTemplate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  providerTemplateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  languageCode?: string;

  @IsOptional()
  @IsIn(TEMPLATE_STATUSES)
  status?: TemplateStatus;
}
