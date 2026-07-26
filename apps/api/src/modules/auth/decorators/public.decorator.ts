import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opts a route out of the global authentication guard.
 *
 * Authentication is deny-by-default (Step 4 section 23: every route protected
 * unless it explicitly says otherwise) - this is the only way to reach a
 * controller method without a valid access token, so its use should stay rare
 * and obvious: login, refresh, forgot/reset-password, health.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
