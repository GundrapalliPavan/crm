import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';

/**
 * Prisma client lifecycle.
 *
 * Connection is intentionally *lazy*: Prisma opens the pool on first query, and
 * eagerly connecting in `onModuleInit` would make the API refuse to boot
 * whenever the database is briefly unavailable. Liveness and readiness are
 * distinct concerns - the process can be alive while the database is not
 * reachable, which is exactly what `/health/ready` reports.
 *
 * No models exist yet; the schema is implemented in a later step.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfigService) {
    super({
      datasources: { db: { url: config.databaseUrl } },
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Cheapest possible round-trip that proves the pool can reach PostgreSQL.
   * Used by the readiness probe; deliberately does not touch business tables.
   */
  async isReachable(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn({ err: error }, 'Database readiness check failed');
      return false;
    }
  }
}
