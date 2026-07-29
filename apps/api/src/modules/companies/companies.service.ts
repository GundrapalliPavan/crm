import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Company, Contact } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { normalizePhone } from '../../common/utils/normalize';
import { PrismaService } from '../../database/prisma.service';
import { CONTACT_INCLUDE, toContact } from '../contacts/contact.mapper';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQuery } from './dto/list-companies.query';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { COMPANY_INCLUDE, toCompany } from './company.mapper';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListCompaniesQuery): Promise<ApiCollectionResponse<Company>> {
    const where: Prisma.CompanyWhereInput = { archivedAt: null };

    if (query.type) where.companyType = query.type;
    if (query.isCustomer !== undefined) where.isCustomer = query.isCustomer;
    if (query.isSupplier !== undefined) where.isSupplier = query.isSupplier;
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { gstin: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: COMPANY_INCLUDE,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: rows.map(toCompany),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id }, include: COMPANY_INCLUDE });
    if (!company) {
      throw new NotFoundError('Company not found.');
    }
    return toCompany(company);
  }

  /** API.md section 48 - the company's contacts, still paginated. */
  async listContacts(
    companyId: string,
    page: number,
    pageSize: number,
  ): Promise<ApiCollectionResponse<Contact>> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundError('Company not found.');
    }

    const where: Prisma.ContactWhereInput = { companyId, archivedAt: null };
    const [rows, totalItems] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: CONTACT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: rows.map(toContact),
      meta: { page, pageSize, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) },
    };
  }

  async create(dto: CreateCompanyDto, actorUserId: string): Promise<Company> {
    if (!dto.confirmDuplicate) {
      await this.assertNoDuplicate(dto.name, dto.gstin, normalizePhone(dto.phone));
    }

    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        companyType: dto.companyType,
        phone: dto.phone,
        phoneNormalized: normalizePhone(dto.phone),
        email: dto.email,
        website: dto.website,
        gstin: dto.gstin,
        taxIdentifier: dto.taxIdentifier,
        stateCode: dto.stateCode,
        ownerId: dto.ownerId,
        creditLimit: dto.creditLimit,
        paymentTermsDays: dto.paymentTermsDays,
        isCustomer: dto.isCustomer,
        isSupplier: dto.isSupplier,
        createdBy: actorUserId,
      },
      include: COMPANY_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'company.created',
      entityType: 'company',
      entityId: company.id,
      afterData: { name: company.name, companyType: company.companyType },
    });

    return toCompany(company);
  }

  async update(id: string, dto: UpdateCompanyDto, actorUserId: string): Promise<Company> {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Company not found.');
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: {
        ...dto,
        phoneNormalized: dto.phone !== undefined ? normalizePhone(dto.phone) : undefined,
      },
      include: COMPANY_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'company.updated',
      entityType: 'company',
      entityId: id,
      // Credit terms are the field most worth a before/after trail here (PROJECT.md section 48).
      beforeData: {
        creditLimit: existing.creditLimit?.toString() ?? null,
        paymentTermsDays: existing.paymentTermsDays,
      },
      afterData: {
        creditLimit: company.creditLimit?.toString() ?? null,
        paymentTermsDays: company.paymentTermsDays,
      },
    });

    return toCompany(company);
  }

  /** DELETE means archive - contacts/orders/invoices may still reference this company. */
  async archive(id: string, actorUserId: string): Promise<void> {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Company not found.');
    }
    if (existing.archivedAt) {
      return;
    }

    await this.prisma.company.update({ where: { id }, data: { archivedAt: new Date() } });
    await this.auditService.record({
      actorUserId,
      action: 'company.archived',
      entityType: 'company',
      entityId: id,
    });
  }

  private async assertNoDuplicate(
    name: string,
    gstin: string | undefined,
    phoneNormalized: string | null,
  ): Promise<void> {
    const matchConditions: Prisma.CompanyWhereInput[] = [{ name: { equals: name, mode: 'insensitive' } }];
    if (gstin) matchConditions.push({ gstin });
    if (phoneNormalized) matchConditions.push({ phoneNormalized });

    const existing = await this.prisma.company.findFirst({
      where: { archivedAt: null, OR: matchConditions },
    });
    if (existing) {
      throw new ConflictError(
        `A company named "${existing.name}" already exists with a matching name, GSTIN or phone.`,
      );
    }
  }
}
