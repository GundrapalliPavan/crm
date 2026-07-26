import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads `apps/api/.env` so the database suite runs from a clean shell.
 *
 * Jest does not read env files, and the global setup and the test workers are
 * separate processes, so this is invoked from both. An environment variable
 * already present always wins, which is how CI injects its own database.
 */
export function loadTestEnv(): void {
  if (process.env.TEST_DATABASE_URL) {
    return;
  }

  const envFile = resolve(__dirname, '..', '..', '.env');

  if (existsSync(envFile)) {
    // Node 22+ built-in; avoids a dotenv dependency for test wiring alone.
    process.loadEnvFile(envFile);
  }
}

loadTestEnv();
