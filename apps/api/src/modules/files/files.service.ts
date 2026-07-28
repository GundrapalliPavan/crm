import { createHash, randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import type { FileAttachment } from '@crm/types';
import { assertEntityExists } from '../../common/entities/entity-existence';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { STORAGE_PROVIDER, type StorageProvider } from '../../infrastructure/storage/storage-provider.interface';
import { ListFilesQuery } from './dto/list-files.query';
import { UploadFileDto } from './dto/upload-file.dto';
import { FILE_LINK_INCLUDE, toFileAttachment } from './file.mapper';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/** ARCHITECTURE.md section 66: validate MIME type on upload, not just extension. */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export interface DownloadResult {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
}

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async list(query: ListFilesQuery): Promise<{ data: FileAttachment[] }> {
    const links = await this.prisma.fileLink.findMany({
      where: { entityType: query.relatedEntityType, entityId: query.relatedEntityId, file: { deletedAt: null } },
      include: FILE_LINK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return { data: links.map(toFileAttachment) };
  }

  async upload(file: Express.Multer.File | undefined, dto: UploadFileDto, actorUserId: string): Promise<FileAttachment> {
    if (!file) {
      throw new ValidationError({ file: ['A file is required.'] });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError({ file: [`File must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`] });
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new ValidationError({ file: [`File type "${file.mimetype}" is not supported.`] });
    }
    await assertEntityExists(this.prisma, dto.relatedEntityType, dto.relatedEntityId);

    const storageKey = `${dto.relatedEntityType}/${randomUUID()}${extname(file.originalname)}`;
    await this.storage.upload({ key: storageKey, buffer: file.buffer, mimeType: file.mimetype });

    const link = await this.prisma.fileLink.create({
      data: {
        purpose: dto.purpose,
        entityType: dto.relatedEntityType,
        entityId: dto.relatedEntityId,
        file: {
          create: {
            storageProvider: 'local',
            storageKey,
            originalFilename: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: BigInt(file.size),
            checksum: createHash('sha256').update(file.buffer).digest('hex'),
            uploadedBy: actorUserId,
          },
        },
      },
      include: FILE_LINK_INCLUDE,
    });

    return toFileAttachment(link);
  }

  async download(fileId: string): Promise<DownloadResult> {
    const file = await this.getActiveFileOrThrow(fileId);
    const buffer = await this.storage.download(file.storageKey);
    return { buffer, originalFilename: file.originalFilename, mimeType: file.mimeType };
  }

  /** Soft-deletes the metadata row (DATABASE.md section 93's `deleted_at`) but reclaims the storage bytes - there is no restore feature in this pass. */
  async delete(fileId: string): Promise<void> {
    const file = await this.getActiveFileOrThrow(fileId);
    await this.storage.delete(file.storageKey);
    await this.prisma.file.update({ where: { id: fileId }, data: { deletedAt: new Date() } });
  }

  private async getActiveFileOrThrow(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file || file.deletedAt) {
      throw new NotFoundError('File not found.');
    }
    return file;
  }
}
