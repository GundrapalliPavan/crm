import { IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { COMMUNICATION_CHANNELS, RELATED_ENTITY_TYPES, type CommunicationChannel, type RelatedEntityType } from '@crm/types';

/** API.md section 85. Either `templateId` + `variables`, or ad-hoc `subject`/`messageBody` - validated in the service, where the message is clearer than a decorator-level cross-field rule. */
export class CreateCommunicationDto {
  @IsIn(COMMUNICATION_CHANNELS)
  channel!: CommunicationChannel;

  @IsString()
  @MaxLength(255)
  recipient!: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  messageBody?: string;

  @IsOptional()
  @IsIn(RELATED_ENTITY_TYPES)
  relatedEntityType?: RelatedEntityType;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;
}
