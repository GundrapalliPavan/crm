import { Controller, Get } from '@nestjs/common';
import type { UnitSummary } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

/**
 * Read access to the seeded unit catalogue (DATABASE.md section 41).
 *
 * Read-only, matching the LeadSources/Roles precedent: units are a small,
 * curated reference list (Piece, Box, Coil, Meter, ...) - API.md section 54
 * leaves authoring endpoints as "depending on requirements", not yet
 * justified.
 */
@Controller('units')
export class UnitsController {
  constructor(private readonly prisma: PrismaService) {}

  @RequirePermission('product.read')
  @Get()
  async list(): Promise<{ data: UnitSummary[] }> {
    const units = await this.prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return {
      data: units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        symbol: unit.symbol,
        decimalAllowed: unit.decimalAllowed,
      })),
    };
  }
}
