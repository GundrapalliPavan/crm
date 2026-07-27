import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { COMMUNICATION_CHANNELS, PAGINATION_DEFAULTS, TEMPLATE_STATUSES, type CommunicationChannel, type TemplateStatus } from '@crm/types';

export class ListCommunicationTemplatesQuery {
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
  @IsIn(TEMPLATE_STATUSES)
  status?: TemplateStatus;
}
