import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Password hashing, isolated behind one service so no other module ever
 * touches `argon2` directly (Step 4 section 8: no custom cryptography, one
 * mature maintained implementation).
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
}
