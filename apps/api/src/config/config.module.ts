import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { validateEnvironment } from './env.validation';

/**
 * Resolved from this file rather than `process.cwd()` so the API loads its own
 * `.env` regardless of the directory it is launched from - in a monorepo the
 * working directory is often the repository root.
 *
 * Holds for both `src/config` (ts-node, jest) and `dist/config` (compiled).
 */
const ENV_FILE_PATH = join(__dirname, '..', '..', '.env');

/**
 * Global configuration module.
 *
 * `validate` runs at module initialisation, so an invalid environment aborts
 * startup rather than failing later at request time. Real environment
 * variables take precedence over the file, which is how staging and production
 * inject configuration without shipping a `.env`.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ENV_FILE_PATH,
      validate: validateEnvironment,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
