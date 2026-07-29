import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Contact } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { normalizeEmail, normalizePhone } from '../../common/utils/normalize';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsQuery } from './dto/list-contacts.query';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CONTACT_INCLUDE, toContact } from './contact.mapper';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListContactsQuery): Promise<ApiCollectionResponse<Contact>> {
    const where: Prisma.ContactWhereInput = { archivedAt: null };

    if (query.companyId) where.companyId = query.companyId;
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: CONTACT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: rows.map(toContact),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Contact> {
    const contact = await this.prisma.contact.findUnique({ where: { id }, include: CONTACT_INCLUDE });
    if (!contact) {
      throw new NotFoundError('Contact not found.');
    }
    return toContact(contact);
  }

  async create(dto: CreateContactDto, actorUserId: string): Promise<Contact> {
    const phoneNormalized = normalizePhone(dto.phone);
    const emailNormalized = normalizeEmail(dto.email);

    if (!dto.confirmDuplicate) {
      await this.assertNoDuplicate(phoneNormalized, emailNormalized);
    }

    const contact = await this.prisma.contact.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        jobTitle: dto.jobTitle,
        phone: dto.phone,
        phoneNormalized,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        emailNormalized,
        companyId: dto.companyId,
        isPrimary: dto.isPrimary,
        ownerId: dto.ownerId,
        createdBy: actorUserId,
      },
      include: CONTACT_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'contact.created',
      entityType: 'contact',
      entityId: contact.id,
      afterData: { firstName: contact.firstName, lastName: contact.lastName, companyId: contact.companyId },
    });

    return toContact(contact);
  }

  async update(id: string, dto: UpdateContactDto, actorUserId: string): Promise<Contact> {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Contact not found.');
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: {
        ...dto,
        phoneNormalized: dto.phone !== undefined ? normalizePhone(dto.phone) : undefined,
        emailNormalized: dto.email !== undefined ? normalizeEmail(dto.email) : undefined,
      },
      include: CONTACT_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'contact.updated',
      entityType: 'contact',
      entityId: id,
    });

    return toContact(contact);
  }

  /** DELETE means archive - a company/lead may still reference this contact historically. */
  async archive(id: string, actorUserId: string): Promise<void> {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Contact not found.');
    }
    if (existing.archivedAt) {
      return;
    }

    await this.prisma.contact.update({ where: { id }, data: { archivedAt: new Date() } });
    await this.auditService.record({
      actorUserId,
      action: 'contact.archived',
      entityType: 'contact',
      entityId: id,
    });
  }

  private async assertNoDuplicate(
    phoneNormalized: string | null,
    emailNormalized: string | null,
  ): Promise<void> {
    if (!phoneNormalized && !emailNormalized) {
      return;
    }

    const matchConditions: Prisma.ContactWhereInput[] = [];
    if (phoneNormalized) matchConditions.push({ phoneNormalized });
    if (emailNormalized) matchConditions.push({ emailNormalized });

    const existing = await this.prisma.contact.findFirst({
      where: { archivedAt: null, OR: matchConditions },
    });
    if (existing) {
      const name = existing.lastName ? `${existing.firstName} ${existing.lastName}` : existing.firstName;
      throw new ConflictError(`A contact for ${name} already exists with a matching phone or email.`);
    }
  }
}
