import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../../config/app-config.service';

/**
 * Access-token claims.
 *
 * Deliberately minimal (Step 4 section 16): just enough to identify the
 * request's user and session. Permissions are never embedded here - they are
 * resolved from the database on every request instead, so a role change takes
 * effect immediately rather than only after the token expires
 * (Step 4 section 34).
 */
export interface AccessTokenClaims {
  /** Subject: user ID. */
  sub: string;
  /** The session (refresh-token lineage) this access token was minted from. */
  sid: string;
}

export interface AccessToken {
  token: string;
  expiresAt: Date;
}

/**
 * Signs and verifies the stateless JWT access token.
 *
 * The refresh token is a separate, opaque, database-backed credential
 * (see `SessionService`) - this service only ever handles the short-lived
 * access token.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  signAccessToken(claims: AccessTokenClaims): AccessToken {
    const ttlSeconds = this.config.authAccessTokenTtlMinutes * 60;

    const token = this.jwtService.sign(claims, {
      secret: this.config.authJwtSecret,
      expiresIn: ttlSeconds,
    });

    return {
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  /** Returns claims for a structurally and cryptographically valid token, or `null`. */
  verifyAccessToken(token: string): AccessTokenClaims | null {
    try {
      return this.jwtService.verify<AccessTokenClaims>(token, {
        secret: this.config.authJwtSecret,
      });
    } catch {
      // Expired, malformed, or signed with a different secret - all
      // indistinguishable to the caller and all mean "not authenticated".
      return null;
    }
  }
}
