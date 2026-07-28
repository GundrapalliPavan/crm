export interface StorageUploadParams {
  key: string;
  buffer: Buffer;
  mimeType: string;
}

/**
 * CLAUDE.md sections 25-27, PROJECT_SETUP.md section 23: business modules
 * never call a specific object-storage SDK directly - they go through this
 * abstraction, so swapping or adding a provider later never touches
 * FilesService. Injected as `STORAGE_PROVIDER` (see files.module.ts).
 */
export interface StorageProvider {
  upload(params: StorageUploadParams): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
