import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CustomerProfile } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { BusinessRuleError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';
import { toCustomerProfile } from './customer-profile.mapper';

export interface EffectiveBillingProfile {
  creditLimit: Prisma.Decimal | null;
  paymentTermsDays: number | null;
}

@Injectable()
export class CustomerProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getByCompanyId(companyId: string): Promise<{ data: CustomerProfile | null }> {
    await this.assertIsCustomer(companyId);
    const profile = await this.prisma.customerProfile.findUnique({ where: { companyId } });
    return { data: profile ? toCustomerProfile(profile) : null };
  }

  async upsert(companyId: string, dto: UpsertCustomerProfileDto, actorUserId: string): Promise<CustomerProfile> {
    await this.assertIsCustomer(companyId);

    const existing = await this.prisma.customerProfile.findUnique({ where: { companyId } });

    const profile = await this.prisma.customerProfile.upsert({
      where: { companyId },
      create: {
        companyId,
        customerCode: dto.customerCode,
        creditLimit: dto.creditLimit,
        paymentTermsDays: dto.paymentTermsDays,
        customerSince: dto.customerSince ? new Date(dto.customerSince) : undefined,
      },
      update: {
        customerCode: dto.customerCode,
        creditLimit: dto.creditLimit,
        paymentTermsDays: dto.paymentTermsDays,
        customerSince: dto.customerSince ? new Date(dto.customerSince) : undefined,
      },
    });

    await this.auditService.record({
      actorUserId,
      action: existing ? 'customer_profile.updated' : 'customer_profile.created',
      entityType: 'customer_profile',
      entityId: profile.companyId,
      beforeData: existing
        ? { creditLimit: existing.creditLimit?.toString() ?? null, paymentTermsDays: existing.paymentTermsDays }
        : undefined,
      afterData: { creditLimit: profile.creditLimit?.toString() ?? null, paymentTermsDays: profile.paymentTermsDays },
    });

    return toCustomerProfile(profile);
  }

  /**
   * DATABASE.md section 33/34: `CustomerProfile` is a customer-specific
   * override, layered over the generic `Company.creditLimit`/
   * `paymentTermsDays` fields Module 1 already exposes - a profile field
   * wins when set, otherwise the company-level value is used.
   */
  async getEffectiveBillingProfile(companyId: string): Promise<EffectiveBillingProfile> {
    const [company, profile] = await Promise.all([
      this.prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
      this.prisma.customerProfile.findUnique({ where: { companyId } }),
    ]);

    return {
      creditLimit: profile?.creditLimit ?? company.creditLimit,
      paymentTermsDays: profile?.paymentTermsDays ?? company.paymentTermsDays,
    };
  }

  private async assertIsCustomer(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found.');
    }
    if (!company.isCustomer) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This company is not marked as a customer.');
    }
  }
}
