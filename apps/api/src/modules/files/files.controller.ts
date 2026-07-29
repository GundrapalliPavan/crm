import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import type { AuthenticatedUser, FileAttachment } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ListFilesQuery } from './dto/list-files.query';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';

/** API.md sections 96-99: direct backend-upload flow, permission-aware, entity-scoped. */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @RequirePermission('file.read')
  @Get()
  list(@Query() query: ListFilesQuery): Promise<{ data: FileAttachment[] }> {
    return this.filesService.list(query);
  }

  @RequirePermission('file.upload')
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadFileDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FileAttachment> {
    return this.filesService.upload(file, dto, actor.id);
  }

  @RequirePermission('file.read')
  @Get(':fileId/download')
  async download(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, originalFilename, mimeType } = await this.filesService.download(fileId);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(originalFilename)}"`,
    });
    return new StreamableFile(buffer);
  }

  @RequirePermission('file.delete')
  @Delete(':fileId')
  delete(@Param('fileId', ParseUUIDPipe) fileId: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.filesService.delete(fileId, actor.id);
  }
}
