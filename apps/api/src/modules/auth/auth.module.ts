import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthService } from './services/auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordService } from './services/password.service';
import { PermissionsService } from './services/permissions.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';

/**
 * Identity and access control (Step 4).
 *
 * `JwtModule.register({})` is intentionally empty: secret and expiry are
 * supplied per call in `TokenService`, sourced from validated configuration,
 * not from static module options - the secret must never be read before
 * `AppConfigModule` has validated it.
 *
 * `JwtAuthGuard` and `PermissionsGuard` are exported so `AppModule` can wire
 * them as global guards; they are not registered as `APP_GUARD` here, to keep
 * "every route is protected by default" a decision visible in one place.
 */
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    PasswordResetService,
    PermissionsService,
    SessionService,
    TokenService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [PermissionsService, JwtAuthGuard, PermissionsGuard],
})
export class AuthModule {}
