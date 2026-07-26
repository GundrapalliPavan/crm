import type { Response } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants';

/**
 * Refresh-token cookie flags (Step 4 section 53).
 *
 *   httpOnly  always - frontend JavaScript must never read the refresh token
 *             (section 53); the access token, not this cookie, is what the API
 *             client attaches to requests.
 *   secure    only outside development, so `http://localhost` still works
 *             without HTTPS locally.
 *   sameSite  'lax' - sent on same-site requests and top-level navigations,
 *             withheld from cross-site POST/fetch, which is what makes the
 *             refresh endpoint safe without a separate CSRF token (see the
 *             CSRF decision in auth.module.ts).
 *   path      scoped to the auth routes so the cookie is never sent to
 *             unrelated API endpoints - narrower than "/" is `config.apiPrefix`
 *             + "/auth", not hardcoded, so it stays correct if the prefix ever
 *             changes.
 */
function cookiePath(config: AppConfigService): string {
  return `/${config.apiPrefix}/auth`;
}

export function setRefreshTokenCookie(
  response: Response,
  config: AppConfigService,
  rawToken: string,
): void {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: cookiePath(config),
    maxAge: config.authRefreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshTokenCookie(response: Response, config: AppConfigService): void {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: cookiePath(config),
  });
}
