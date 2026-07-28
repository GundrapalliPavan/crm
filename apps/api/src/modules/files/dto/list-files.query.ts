import { IsEnum, IsUUID } from 'class-validator';
import { RELATED_ENTITY_TYPES, type RelatedEntityType } from '@crm/types';

export class ListFilesQuery {
  @IsEnum(RELATED_ENTITY_TYPES, { message: `relatedEntityType must be one of: ${RELATED_ENTITY_TYPES.join(', ')}` })
  relatedEntityType!: RelatedEntityType;

  @IsUUID()
  relatedEntityId!: string;
}
