import { Injectable } from '@nestjs/common';
import type { SupplierProfile } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { BusinessRuleError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';
import { toSupplierProfile } from './supplier-profile.mapper';

@Injectable()
export class SupplierProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getByCompanyId(companyId: string): Promise<{ data: SupplierProfile | null }> {
    await this.assertIsSupplier(companyId);
    const profile = await this.prisma.supplierProfile.findUnique({ where: { companyId } });
    return { data: profile ? toSupplierProfile(profile) : null };
  }

  async upsert(companyId: string, dto: UpsertSupplierProfileDto, actorUserId: string): Promise<SupplierProfile> {
    await this.assertIsSupplier(companyId);

    const existing = await this.prisma.supplierProfile.findUnique({ where: { companyId } });

    const profile = await this.prisma.supplierProfile.upsert({
      where: { companyId },
      create: {
        companyId,
        supplierCode: dto.supplierCode,
        paymentTermsDays: dto.paymentTermsDays,
        supplierSince: dto.supplierSince ? new Date(dto.supplierSince) : undefined,
        notes: dto.notes,
      },
      update: {
        supplierCode: dto.supplierCode,
        paymentTermsDays: dto.paymentTermsDays,
        supplierSince: dto.supplierSince ? new Date(dto.supplierSince) : undefined,
        notes: dto.notes,
      },
    });

    await this.auditService.record({
      actorUserId,
      action: existing ? 'supplier_profile.updated' : 'supplier_profile.created',
      entityType: 'supplier_profile',
      entityId: profile.companyId,
      beforeData: existing ? { paymentTermsDays: existing.paymentTermsDays } : undefined,
      afterData: { paymentTermsDays: profile.paymentTermsDays },
    });

    return toSupplierProfile(profile);
  }

  private async assertIsSupplier(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found.');
    }
    if (!company.isSupplier) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This company is not marked as a supplier.');
    }
  }
}
