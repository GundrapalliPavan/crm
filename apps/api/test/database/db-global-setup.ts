import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadTestEnv } from './load-test-env';

/**
 * Brings the dedicated test database up to the current migration state before
 * the suite runs.
 *
 * `migrate deploy` only applies committed migrations - it never resets or drops
 * data - so this proves the schema is reproducible from migration files alone
 * (Step 3 requirement: empty database -> migrations -> schema).
 */
export default function globalSetup(): void {
  loadTestEnv();

  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env; ' +
        'it must point at a dedicated test database, never at development or production data.',
    );
  }

  // Guard against a misconfigured URL pointing at a real database: this suite
  // truncates tables between tests.
  if (!/_test(\?|$)/.test(databaseUrl)) {
    throw new Error(
      `Refusing to run destructive database tests against "${databaseUrl.replace(/:[^:@]*@/, ':***@')}". ` +
        'TEST_DATABASE_URL must name a database ending in "_test".',
    );
  }

  execSync('pnpm exec prisma migrate deploy', {
    cwd: resolve(__dirname, '..', '..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
}
