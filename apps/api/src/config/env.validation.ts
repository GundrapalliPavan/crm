import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

/** Minimum acceptable length for AUTH_JWT_SECRET, in any environment. */
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Values that must never sign production tokens. Not exhaustive - it exists to
 * catch an accidentally-copied example value, not to replace real secret
 * management (Step 4 section 102).
 */
const BANNED_PRODUCTION_JWT_SECRETS = new Set([
  'secret',
  'changeme',
  'change-me',
  'development-secret',
  'your-secret-here',
]);

/**
 * Shape of the environment this application requires in order to start.
 *
 * Every variable listed here is mandatory: the application fails fast at boot
 * rather than surfacing a misconfiguration on the first customer request
 * (BACKEND.md section 144, PROJECT_SETUP.md section 44).
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv, {
    message: `NODE_ENV must be one of: ${Object.values(NodeEnv).join(', ')}`,
  })
  NODE_ENV!: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  API_PREFIX!: string;

  /**
   * Origin allowed to call this API from a browser. Kept as a single origin for
   * now; widen to a list only when a second browser client actually exists
   * (API.md section 138 - no unrestricted CORS on authenticated APIs).
   */
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: 'WEB_ORIGIN must be a valid URL' },
  )
  WEB_ORIGIN!: string;

  /**
   * Validated as a string rather than a URL: PostgreSQL connection strings
   * carry query parameters and credentials that generic URL validators reject.
   * Prisma performs the authoritative parse when a connection is opened.
   */
  @IsString()
  DATABASE_URL!: string;

  /**
   * Signs and verifies access-token JWTs. Length is checked here; production
   * placeholder values are rejected separately in `validateEnvironment` below,
   * since that check depends on NODE_ENV.
   */
  @IsString()
  @MinLength(MIN_JWT_SECRET_LENGTH, {
    message: `AUTH_JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
  })
  AUTH_JWT_SECRET!: string;

  /** Access token lifetime. Short by design - see auth.constants.ts. */
  @IsInt()
  @Min(1)
  AUTH_ACCESS_TOKEN_TTL_MINUTES!: number;

  /** Refresh session lifetime - bounds how long an unused login stays valid. */
  @IsInt()
  @Min(1)
  AUTH_REFRESH_TOKEN_TTL_DAYS!: number;

  /**
   * Optional first-administrator bootstrap (Step 4 section 84). Both or
   * neither must be set; enforced in bootstrap-admin.ts, not here, since an
   * absent pair is the normal state after the first run.
   */
  @IsOptional()
  @IsEmail({}, { message: 'BOOTSTRAP_ADMIN_EMAIL must be a valid email address' })
  BOOTSTRAP_ADMIN_EMAIL?: string;

  @IsOptional()
  @IsString()
  BOOTSTRAP_ADMIN_PASSWORD?: string;

  /**
   * Local-disk root for uploaded files (PROJECT_SETUP.md section 23: "Local
   * development may use local storage"). Optional - defaults to a directory
   * next to the API package when unset (see AppConfigService), so existing
   * `.env` files keep working. A real cloud provider is a later binding swap
   * in files.module.ts, not a config value.
   */
  @IsOptional()
  @IsString()
  STORAGE_LOCAL_PATH?: string;

  /**
   * Real providers for Communication (Module 8's `CommunicationProvider`
   * abstraction: Twilio for WhatsApp/SMS, SendGrid for Email) - all
   * optional. Each channel degrades independently to an honest "not
   * configured" failure (CLAUDE.md section 31) when its own variables are
   * absent - this repository has no real account with either vendor, so
   * nothing here can actually send until an operator supplies real
   * credentials.
   */
  @IsOptional()
  @IsString()
  TWILIO_ACCOUNT_SID?: string;

  @IsOptional()
  @IsString()
  TWILIO_AUTH_TOKEN?: string;

  /** WhatsApp-enabled sender, e.g. "whatsapp:+14155238886" (Twilio's sandbox number in development). */
  @IsOptional()
  @IsString()
  TWILIO_WHATSAPP_FROM?: string;

  /** SMS-enabled Twilio phone number, e.g. "+15005550006". */
  @IsOptional()
  @IsString()
  TWILIO_SMS_FROM?: string;

  @IsOptional()
  @IsString()
  SENDGRID_API_KEY?: string;

  @IsOptional()
  @IsEmail({}, { message: 'SENDGRID_FROM_EMAIL must be a valid email address' })
  SENDGRID_FROM_EMAIL?: string;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: false,
  });

  const extraErrors: string[] = [];

  if (
    validated.NODE_ENV === NodeEnv.Production &&
    BANNED_PRODUCTION_JWT_SECRETS.has(validated.AUTH_JWT_SECRET?.toLowerCase().trim())
  ) {
    extraErrors.push('  - AUTH_JWT_SECRET: must not be a placeholder value in production');
  }

  if (errors.length === 0 && extraErrors.length === 0) {
    return validated;
  }

  const details = [
    ...errors.map((error) => {
      const messages = Object.values(error.constraints ?? {}).join(', ');
      return `  - ${error.property}: ${messages}`;
    }),
    ...extraErrors,
  ].join('\n');

  // Thrown before the Nest logger exists, so the message must be self-contained.
  // Never include the received values: DATABASE_URL and AUTH_JWT_SECRET carry
  // credentials.
  throw new Error(`Invalid environment configuration:\n${details}`);
}
