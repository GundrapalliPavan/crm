/**
 * First-administrator bootstrap (Step 4 sections 84-86).
 *
 * Deliberately outside the Nest DI container, like `seed.ts` - this is a
 * one-off operational script, not application code, so it talks to Postgres
 * directly through Prisma and hashes with `argon2` directly rather than
 * standing up the whole application to reach one service.
 *
 * Runs only when BOTH `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`
 * are set, and only if no user with that email already exists - safe to leave
 * in every environment's script list and to run repeatedly. There is no
 * hardcoded default account anywhere in this codebase (section 84): a
 * production administrator is created by setting these two variables for
 * exactly one deploy/run, then unsetting them.
 */
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from '../src/modules/auth/auth.constants';

const ADMINISTRATOR_ROLE_NAME = 'Administrator';

async function main(): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      'Skipping administrator bootstrap: BOOTSTRAP_ADMIN_EMAIL and ' +
        'BOOTSTRAP_ADMIN_PASSWORD must both be set to run it.',
    );
    return;
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH ||
    !PASSWORD_PATTERN.test(password)
  ) {
    throw new Error(
      `BOOTSTRAP_ADMIN_PASSWORD does not meet the password policy ` +
        `(${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters, at least one letter and one number).`,
    );
  }

  const prisma = new PrismaClient();

  try {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      console.log(`Administrator bootstrap: a user already exists for ${normalizedEmail} - skipping.`);
      return;
    }

    const administratorRole = await prisma.role.findUnique({
      where: { name: ADMINISTRATOR_ROLE_NAME },
    });

    if (!administratorRole) {
      throw new Error(
        `The "${ADMINISTRATOR_ROLE_NAME}" role does not exist yet. Run the reference-data seed ` +
          '(pnpm db:seed) before bootstrapping an administrator.',
      );
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          firstName: 'Administrator',
          lastName: 'User',
          email: normalizedEmail,
          passwordHash,
          status: 'active',
        },
      });

      await tx.userRole.create({
        data: { userId: created.id, roleId: administratorRole.id },
      });

      return created;
    });

    console.log(`Administrator bootstrapped: ${user.email} (id: ${user.id}).`);
    console.log('Unset BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD now that this has run.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Administrator bootstrap failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
