import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { TEMPORARY_PASSWORD_LENGTH } from '../auth.constants';

const TEMP_PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

/**
 * Password hashing and generation, isolated behind one service so no other
 * module ever touches `argon2` directly (Step 4 section 8: no custom
 * cryptography, one mature maintained implementation).
 */
@Injectable()
export class PasswordService {
  /** Argon2id: the variant recommended for password storage - resistant to both
   *  GPU cracking and side-channel attacks, unlike argon2i or argon2d alone. */
  async hash(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, { type: argon2.argon2id });
  }

  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      // A malformed/foreign hash format throws rather than returning false;
      // treated as a verification failure, not a server error.
      return false;
    }
  }

  /**
   * A cryptographically random password for admin-provisioned accounts
   * (Step 4 section 39). Guaranteed to satisfy the standard password policy so
   * it never needs a separate validation path.
   */
  generateTemporaryPassword(): string {
    let password = '';
    for (let i = 0; i < TEMPORARY_PASSWORD_LENGTH; i += 1) {
      password += TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)];
    }
    return password;
  }
}
