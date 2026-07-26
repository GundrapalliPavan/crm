import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedUser, LoginResponse, RefreshResponse } from '@crm/types';
import type { Request, Response } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from './auth-cookie.util';
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './services/auth.service';
import type { DeviceContext } from './services/session.service';

/**
 * Login rate limit (Step 4 section 47): far stricter than the application
 * default, since this endpoint is the one an attacker would brute-force.
 */
const LOGIN_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

function deviceContextOf(request: Request): DeviceContext {
  return {
    userAgent: request.headers['user-agent'],
    ipAddress: request.ip,
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Public()
  @Throttle(LOGIN_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const { response: body, rawRefreshToken } = await this.authService.login(
      dto.email,
      dto.password,
      deviceContextOf(request),
    );

    setRefreshTokenCookie(response, this.config, rawRefreshToken);

    return body;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponse> {
    const rawRefreshToken: unknown = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (typeof rawRefreshToken !== 'string' || rawRefreshToken.length === 0) {
      // Not one of our stable AppError codes: there is no session to speak
      // of, so this deliberately behaves like any other unauthenticated
      // request rather than claiming a specific (nonexistent) session expired.
      throw new UnauthorizedException('Authentication is required.');
    }

    const { response: body, rawRefreshToken: newRawToken } = await this.authService.refresh(
      rawRefreshToken,
      deviceContextOf(request),
    );

    setRefreshTokenCookie(response, this.config, newRawToken);

    return body;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(request.identity!.sessionId);
    clearRefreshTokenCookie(response, this.config);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll(request.identity!.userId);
    clearRefreshTokenCookie(response, this.config);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Public()
  @Throttle(LOGIN_THROTTLE)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);

    // Same response whether or not the email matched an account
    // (Step 4 section 43 - no user enumeration).
    return { message: 'If an account is eligible, password reset instructions will be sent.' };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(
      user.id,
      request.identity!.sessionId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
