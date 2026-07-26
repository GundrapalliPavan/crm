import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './common/audit/audit.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingModule } from './common/logging/logging.module';
import { validationPipeOptions } from './common/pipes/validation-exception.factory';
import { RequestContextModule } from './common/request-context/request-context.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { HealthModule } from './modules/health/health.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';

/**
 * Root module.
 *
 * The request-context middleware is intentionally *not* registered here: it
 * must run before the body parsers, which module middleware cannot do. It is
 * applied in `configureApp` instead.
 *
 * Global guard order (Step 4 section 46-47, 23):
 *   1. ThrottlerGuard    - cheap, no DB access; blocks abuse before anything
 *                          else runs. A stricter per-route limit is applied to
 *                          login/forgot-password with `@Throttle(...)`.
 *   2. JwtAuthGuard      - authentication; deny-by-default unless `@Public()`.
 *   3. PermissionsGuard  - authorization; no-op unless `@RequirePermission()`.
 * `useExisting` (not `useClass`) for the auth guards: they are already
 * singletons exported by `AuthModule`, so this reuses that instance instead of
 * constructing a second one.
 */
@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    RequestContextModule,
    AuditModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    AuthModule,
    UsersModule,
    RolesModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useValue: new ValidationPipe(validationPipeOptions) },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: PermissionsGuard },
  ],
})
export class AppModule {}
