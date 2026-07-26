import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

interface LivenessBody {
  status: 'ok';
}

interface ReadinessBody {
  status: 'ready' | 'not_ready';
  dependencies: {
    database: 'up' | 'down';
  };
}

/**
 * Infrastructure probes.
 *
 * Deliberately returns no version, hostname, connection string or dependency
 * detail beyond up/down - these endpoints are typically reachable from load
 * balancers and must not disclose infrastructure (API.md section 146,
 * ARCHITECTURE.md section 98).
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness: is the process running and able to serve HTTP?
   * Must stay dependency-free, otherwise a database blip would cause
   * orchestrators to kill otherwise-healthy containers.
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  checkLiveness(): LivenessBody {
    return { status: 'ok' };
  }

  /**
   * Readiness: can this instance actually serve requests right now?
   *
   * Returns 503 when a required dependency is unreachable so that load
   * balancers stop routing traffic here. Only dependencies that are genuinely
   * configured are checked - nothing is stubbed to look healthy.
   */
  @Public()
  @Get('ready')
  async checkReadiness(@Res({ passthrough: true }) response: Response): Promise<ReadinessBody> {
    const databaseUp = await this.prisma.isReachable();

    response.status(databaseUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

    return {
      status: databaseUp ? 'ready' : 'not_ready',
      dependencies: { database: databaseUp ? 'up' : 'down' },
    };
  }
}
