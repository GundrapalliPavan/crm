import { IsEnum, IsUUID } from 'class-validator';
import { FILE_PURPOSES, RELATED_ENTITY_TYPES, type FilePurpose, type RelatedEntityType } from '@crm/types';

/** Arrives as multipart form fields alongside the file itself (see files.controller.ts). */
export class UploadFileDto {
  @IsEnum(RELATED_ENTITY_TYPES, { message: `relatedEntityType must be one of: ${RELATED_ENTITY_TYPES.join(', ')}` })
  relatedEntityType!: RelatedEntityType;

  @IsUUID()
  relatedEntityId!: string;

  @IsEnum(FILE_PURPOSES, { message: `purpose must be one of: ${FILE_PURPOSES.join(', ')}` })
  purpose!: FilePurpose;
}
