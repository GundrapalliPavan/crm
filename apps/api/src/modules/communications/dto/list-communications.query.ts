import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import {
  COMMUNICATION_CHANNELS,
  COMMUNICATION_STATUSES,
  PAGINATION_DEFAULTS,
  RELATED_ENTITY_TYPES,
  type CommunicationChannel,
  type CommunicationStatus,
  type RelatedEntityType,
} from '@crm/types';

export class ListCommunicationsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = PAGINATION_DEFAULTS.page;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_DEFAULTS.maxPageSize)
  pageSize: number = PAGINATION_DEFAULTS.pageSize;

  @IsOptional()
  @IsIn(COMMUNICATION_CHANNELS)
  channel?: CommunicationChannel;

  @IsOptional()
  @IsIn(COMMUNICATION_STATUSES)
  status?: CommunicationStatus;

  @IsOptional()
  @IsIn(RELATED_ENTITY_TYPES)
  relatedEntityType?: RelatedEntityType;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
