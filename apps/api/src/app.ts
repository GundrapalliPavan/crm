import { NestFactory } from '@nestjs/core';
import { REQUEST_ID_HEADER } from '@crm/types';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { createRequestContextMiddleware } from './common/request-context/request-context.middleware';
import { RequestContextService } from './common/request-context/request-context.service';
import { AppConfigService } from './config/app-config.service';

/**
 * Upper bound on JSON/urlencoded request bodies.
 *
 * Sized for operational API payloads. File uploads must not be widened into
 * this limit - they go through the storage service with their own validation
 * (PROJECT_SETUP.md section 59).
 */
const MAX_REQUEST_BODY_SIZE = '1mb';

/**
 * Nest's automatic body parsing is disabled at creation so that middleware can
 * be ordered explicitly in `configureApp`.
 */
export const APP_CREATE_OPTIONS = { bodyParser: false } as const;

/**
 * Applies the middleware stack, prefix and CORS policy to an already-created
 * application.
 *
 * Shared by `createApp` and the integration tests so both exercise the same
 * stack - a test that approximates the middleware order would not catch
 * ordering defects.
 *
 * Order is significant:
 *   1. request context - so every later log line and error carries the ID,
 *      including failures raised by the body parsers themselves
 *   2. security headers
 *   3. cookies (the refresh token) and body parsing, with an explicit size limit
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(AppConfigService);

  app.use(createRequestContextMiddleware(app.get(RequestContextService)));
  app.use(helmet());

  // Unsigned: the refresh token inside is itself a high-entropy secret that the
  // server verifies by hashed lookup, so a signing secret here would add
  // complexity without adding security.
  app.use(cookieParser());

  app.useBodyParser('json', { limit: MAX_REQUEST_BODY_SIZE });
  app.useBodyParser('urlencoded', { limit: MAX_REQUEST_BODY_SIZE, extended: true });

  app.setGlobalPrefix(config.apiPrefix);

  app.enableCors({
    origin: config.webOrigin,
    credentials: true,
    // Lets the browser client read the correlation ID off cross-origin responses.
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  // Routes SIGTERM/SIGINT through Nest's lifecycle so `onModuleDestroy` hooks
  // (currently: closing the Prisma pool) run before the process exits.
  app.enableShutdownHooks();
}

/**
 * Creates and fully configures the application without binding a port.
 *
 * Kept separate from `main.ts` so integration tests can exercise the real
 * middleware, pipe and filter stack in-process.
 *
 * API versioning is carried by the global prefix (`api/v1`) rather than Nest's
 * `enableVersioning`, since the version is part of the configured prefix
 * (API.md section 3).
 */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    ...APP_CREATE_OPTIONS,
  });

  app.useLogger(app.get(Logger));

  configureApp(app);

  return app;
}
