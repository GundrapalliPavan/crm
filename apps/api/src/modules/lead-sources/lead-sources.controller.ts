import { Controller, Get } from '@nestjs/common';
import type { LeadSourceSummary } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

/**
 * Read access to the seeded lead source catalogue (CRM.md section 14).
 *
 * Sources drive marketing-effectiveness reporting, so they are a managed
 * reference table rather than free text on the lead - but authoring new
 * sources is not yet exposed via API, matching how roles/permissions are
 * currently read-only (Step 4 precedent).
 */
@Controller('lead-sources')
export class LeadSourcesController {
  constructor(private readonly prisma: PrismaService) {}

  @RequirePermission('lead.read')
  @Get()
  async list(): Promise<{ data: LeadSourceSummary[] }> {
    const sources = await this.prisma.leadSource.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return { data: sources.map((source) => ({ id: source.id, name: source.name })) };
  }
}
