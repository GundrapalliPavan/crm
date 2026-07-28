import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './env.validation';

/** Resolved from this file's location, not `process.cwd()` - see config.module.ts's ENV_FILE_PATH for why. */
const DEFAULT_STORAGE_LOCAL_PATH = join(__dirname, '..', '..', 'uploads');

/**
 * Typed access to validated configuration.
 *
 * Application code injects this instead of reading `process.env` directly, so
 * that configuration stays centralised and validated (PROJECT_SETUP.md
 * section 3.3, BACKEND.md section 145).
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  get nodeEnv(): NodeEnv {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get apiPrefix(): string {
    return this.config.get('API_PREFIX', { infer: true });
  }

  get webOrigin(): string {
    return this.config.get('WEB_ORIGIN', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get authJwtSecret(): string {
    return this.config.get('AUTH_JWT_SECRET', { infer: true });
  }

  get authAccessTokenTtlMinutes(): number {
    return this.config.get('AUTH_ACCESS_TOKEN_TTL_MINUTES', { infer: true });
  }

  get authRefreshTokenTtlDays(): number {
    return this.config.get('AUTH_REFRESH_TOKEN_TTL_DAYS', { infer: true });
  }

  get bootstrapAdminEmail(): string | undefined {
    return this.config.get('BOOTSTRAP_ADMIN_EMAIL', { infer: true });
  }

  get bootstrapAdminPassword(): string | undefined {
    return this.config.get('BOOTSTRAP_ADMIN_PASSWORD', { infer: true });
  }

  get storageLocalPath(): string {
    return this.config.get('STORAGE_LOCAL_PATH', { infer: true }) ?? DEFAULT_STORAGE_LOCAL_PATH;
  }

  get twilioAccountSid(): string | undefined {
    return this.config.get('TWILIO_ACCOUNT_SID', { infer: true });
  }

  get twilioAuthToken(): string | undefined {
    return this.config.get('TWILIO_AUTH_TOKEN', { infer: true });
  }

  get twilioWhatsAppFrom(): string | undefined {
    return this.config.get('TWILIO_WHATSAPP_FROM', { infer: true });
  }

  get twilioSmsFrom(): string | undefined {
    return this.config.get('TWILIO_SMS_FROM', { infer: true });
  }

  get sendGridApiKey(): string | undefined {
    return this.config.get('SENDGRID_API_KEY', { infer: true });
  }

  get sendGridFromEmail(): string | undefined {
    return this.config.get('SENDGRID_FROM_EMAIL', { infer: true });
  }
}
