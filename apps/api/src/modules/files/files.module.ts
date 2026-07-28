import { Module } from '@nestjs/common';
import { LocalFilesystemStorageProvider } from '../../infrastructure/storage/local-filesystem-storage.provider';
import { STORAGE_PROVIDER } from '../../infrastructure/storage/storage-provider.interface';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

/** Swap the `STORAGE_PROVIDER` binding for a cloud implementation here when one is chosen - never in FilesService. */
@Module({
  controllers: [FilesController],
  providers: [FilesService, { provide: STORAGE_PROVIDER, useClass: LocalFilesystemStorageProvider }],
  exports: [FilesService],
})
export class FilesModule {}
