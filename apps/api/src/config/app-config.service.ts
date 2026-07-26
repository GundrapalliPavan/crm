import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './env.validation';

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
}
