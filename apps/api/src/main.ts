import { Logger } from '@nestjs/common';
import { createApp } from './app';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const config = app.get(AppConfigService);

  await app.listen(config.port);

  new Logger('Bootstrap').log(
    `API listening on port ${config.port} at /${config.apiPrefix} (${config.nodeEnv})`,
  );
}

bootstrap().catch((error: unknown) => {
  // The Nest logger may not be available yet if configuration validation
  // failed, so report through the console and exit non-zero for the supervisor.
  console.error('Failed to start API:', error instanceof Error ? error.message : error);
  process.exit(1);
});
