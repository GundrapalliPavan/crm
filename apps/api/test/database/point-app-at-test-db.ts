import { join } from 'node:path';
import { loadTestEnv } from './load-test-env';

/**
 * Points the application's own configuration at the dedicated test database.
 *
 * Runs as a Jest `setupFile`, which Jest guarantees executes before the test
 * module itself is required - the only point at which mutating `process.env`
 * is guaranteed to land before `AppConfigModule`'s `ConfigModule.forRoot()`
 * reads it (that call happens at import time, as soon as `AppModule` is
 * loaded, not when the test later compiles it).
 */
loadTestEnv();

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env; ' +
      'it must point at a dedicated test database, never at development or production data.',
  );
}

// Same guard as db-global-setup.ts: refuses to let the booted API connect to
// anything that is not unambiguously a test database.
if (!/_test(\?|$)/.test(testDatabaseUrl)) {
  throw new Error(
    `Refusing to run the API against "${testDatabaseUrl.replace(/:[^:@]*@/, ':***@')}" in tests. ` +
      'TEST_DATABASE_URL must name a database ending in "_test".',
  );
}

process.env.DATABASE_URL = testDatabaseUrl;

// Files tests write real bytes through LocalFilesystemStorageProvider - keep
// them out of the development uploads directory entirely.
process.env.STORAGE_LOCAL_PATH = join(__dirname, '..', '..', 'uploads-test');
