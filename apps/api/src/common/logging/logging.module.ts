import { Module } from '@nestjs/common';
import { REQUEST_ID_HEADER } from '@crm/types';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigService } from '../../config/app-config.service';
import { NodeEnv } from '../../config/env.validation';

/**
 * Header and body paths scrubbed from every log line.
 *
 * BACKEND.md section 137 forbids logging credentials or authentication
 * material. Redaction is enforced centrally here rather than trusting every
 * future call site to remember.
 */
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.otp',
];

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        // Set explicitly because the library default (`*`) uses pre-v8
        // path-to-regexp syntax and logs a deprecation warning under Express 5.
        forRoutes: ['{*path}'],
        pinoHttp: {
          level: config.nodeEnv === NodeEnv.Production ? 'info' : 'debug',
          autoLogging: config.nodeEnv !== NodeEnv.Test,
          redact: { paths: REDACTED_PATHS, censor: '[redacted]' },

          // Correlate every log line with the ID surfaced in error responses.
          customProps: (req) => ({
            requestId: req.headers[REQUEST_ID_HEADER],
          }),

          // Log only what is needed to trace a request. Full request bodies are
          // never serialised: they routinely contain customer data.
          serializers: {
            req: (req: { method: string; url: string }) => ({
              method: req.method,
              path: req.url,
            }),
            res: (res: { statusCode: number }) => ({
              statusCode: res.statusCode,
            }),
          },
        },
      }),
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
