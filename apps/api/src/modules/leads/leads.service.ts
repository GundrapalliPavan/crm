import { Injectable } from '@nestjs/common';
import { Prisma, type Lead as PrismaLead } from '@prisma/client';
import type { ApiCollectionResponse, Lead, LeadActivity, LeadActivityType } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from '../../common/errors/app-error';
import { normalizeEmail, normalizePhone } from '../../common/utils/normalize';
import { PrismaService } from '../../database/prisma.service';
import { AssignLeadDto } from './dto/assign-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadStatusTransitionDto } from './dto/lead-status-transition.dto';
import { ListLeadsQuery } from './dto/list-leads.query';
import { UpdateLeadDto } from './dto/update-lead.dto';
import {
  LEAD_ACTIVITY_INCLUDE,
  LEAD_INCLUDE,
  toLead,
  toLeadActivity,
  type LeadWithRelations,
} from './lead.mapper';

/** Statuses that no longer represent an open, actionable lead. */
const CLOSED_STATUSES = ['converted', 'lost', 'unqualified', 'duplicate'] as const;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListLeadsQuery): Promise<ApiCollectionResponse<Lead>> {
    const where: Prisma.LeadWhereInput = { archivedAt: null };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.leadType) where.leadType = query.leadType;
    if (query.sourceId) where.sourceId = query.sourceId;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.unassigned) where.assignedTo = null;

    if (query.overdueFollowUp) {
      where.nextFollowUpAt = { lt: new Date() };
      where.status = { notIn: [...CLOSED_STATUSES] };
    } else if (query.nextFollowUpFrom || query.nextFollowUpTo) {
      where.nextFollowUpAt = {
        ...(query.nextFollowUpFrom ? { gte: new Date(query.nextFollowUpFrom) } : {}),
        ...(query.nextFollowUpTo ? { lte: new Date(query.nextFollowUpTo) } : {}),
      };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: LEAD_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: rows.map(toLead),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: LEAD_INCLUDE });

    if (!lead) {
      throw new NotFoundError('Lead not found.');
    }

    return toLead(lead);
  }

  /**
   * CRM.md section 45: a possible duplicate blocks creation with a clear
   * reason unless the caller explicitly confirms. Checked against both open
   * leads and existing contacts, since re-enquiring from an existing
   * customer is just as much a duplicate as a second lead for the same
   * prospect.
   */
  async create(dto: CreateLeadDto, actorUserId: string): Promise<Lead> {
    const phoneNormalized = normalizePhone(dto.phone);
    const emailNormalized = normalizeEmail(dto.email);

    if (!dto.confirmDuplicate) {
      await this.assertNoDuplicate(phoneNormalized, emailNormalized);
    }

    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        companyName: dto.companyName,
        phone: dto.phone,
        phoneNormalized,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        emailNormalized,
        sourceId: dto.sourceId,
        leadType: dto.leadType,
        priority: dto.priority,
        assignedTo: dto.assignedTo,
        assignedTeamId: dto.assignedTeamId,
        estimatedValue: dto.estimatedValue,
        notes: dto.notes,
        nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : undefined,
        createdBy: actorUserId,
      },
      include: LEAD_INCLUDE,
    });

    await this.recordActivity(lead.id, 'created', 'Lead created', actorUserId);
    if (dto.assignedTo) {
      await this.recordActivity(lead.id, 'assigned', 'Lead assigned', actorUserId, {
        assignedTo: dto.assignedTo,
      });
    }

    return toLead(lead);
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead not found.');
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        phoneNormalized: dto.phone !== undefined ? normalizePhone(dto.phone) : undefined,
        emailNormalized: dto.email !== undefined ? normalizeEmail(dto.email) : undefined,
        nextFollowUpAt: dto.nextFollowUpAt !== undefined ? new Date(dto.nextFollowUpAt) : undefined,
      },
      include: LEAD_INCLUDE,
    });

    return toLead(lead);
  }

  /** DELETE means archive (CRM.md: "Deletion may mean archive"), never a hard delete. */
  async archive(id: string, actorUserId: string): Promise<void> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead not found.');
    }
    if (existing.archivedAt) {
      return;
    }

    await this.prisma.lead.update({ where: { id }, data: { archivedAt: new Date() } });
    await this.auditService.record({
      actorUserId,
      action: 'lead.archived',
      entityType: 'lead',
      entityId: id,
    });
  }

  async assign(id: string, dto: AssignLeadDto, actorUserId: string): Promise<Lead> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead not found.');
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { assignedTo: dto.userId, assignedTeamId: dto.teamId },
      include: LEAD_INCLUDE,
    });

    await this.recordActivity(id, 'assigned', 'Lead reassigned', actorUserId, {
      previousAssignee: existing.assignedTo,
      newAssignee: dto.userId ?? null,
      newTeam: dto.teamId ?? null,
    });

    return toLead(lead);
  }

  /**
   * CRM.md sections 49-51: a loss reason is required going to `lost`, and
   * reopening (transitioning away from `lost`) clears the current
   * lost-reason fields - the historical record survives in LeadActivity
   * instead, so nothing is erased (section 51: "do not erase historical
   * outcomes").
   */
  async transitionStatus(
    id: string,
    dto: LeadStatusTransitionDto,
    actorUserId: string,
  ): Promise<Lead> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead not found.');
    }
    if (existing.status === 'converted') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'A converted lead cannot change status.');
    }

    const isLosing = dto.status === 'lost';
    const wasLost = existing.status === 'lost';

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: dto.status,
        lostReason: isLosing ? dto.lostReason : wasLost ? null : undefined,
        lostNotes: isLosing ? dto.notes : wasLost ? null : undefined,
        lostAt: isLosing ? new Date() : wasLost ? null : undefined,
      },
      include: LEAD_INCLUDE,
    });

    await this.recordActivity(id, 'status_changed', `Status changed to ${dto.status}`, actorUserId, {
      from: existing.status,
      to: dto.status,
      notes: dto.notes ?? null,
      lostReason: dto.lostReason ?? null,
    });

    return toLead(lead);
  }

  /**
   * API.md section 42 / CRM.md sections 47-48: creates or links a Company and
   * Contact and marks the lead converted, as one transaction. Never creates a
   * duplicate company/contact when an existing match can be found.
   */
  async convert(id: string, dto: ConvertLeadDto, actorUserId: string): Promise<Lead> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead not found.');
    }
    if (existing.status === 'converted') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This lead has already been converted.');
    }

    const lead = await this.prisma.$transaction(async (tx) => {
      const companyId = await this.resolveCompanyForConversion(tx, existing, dto);
      const contactId = await this.resolveContactForConversion(tx, existing, dto, companyId);

      const updated = await tx.lead.update({
        where: { id },
        data: {
          status: 'converted',
          convertedAt: new Date(),
          convertedContactId: contactId,
          convertedCompanyId: companyId,
        },
        include: LEAD_INCLUDE,
      });

      await tx.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'converted',
          title: 'Lead converted',
          performedBy: actorUserId,
          metadata: { contactId, companyId },
        },
      });

      return updated;
    });

    await this.auditService.record({
      actorUserId,
      action: 'lead.converted',
      entityType: 'lead',
      entityId: id,
      afterData: { contactId: lead.convertedContactId, companyId: lead.convertedCompanyId },
    });

    return toLead(lead);
  }

  async listActivities(leadId: string): Promise<{ data: LeadActivity[] }> {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundError('Lead not found.');
    }

    const activities = await this.prisma.leadActivity.findMany({
      where: { leadId },
      include: LEAD_ACTIVITY_INCLUDE,
      orderBy: { activityAt: 'desc' },
    });

    return { data: activities.map(toLeadActivity) };
  }

  async createActivity(
    leadId: string,
    dto: CreateLeadActivityDto,
    actorUserId: string,
  ): Promise<LeadActivity> {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundError('Lead not found.');
    }

    const activity = await this.prisma.leadActivity.create({
      data: {
        leadId,
        activityType: dto.activityType,
        title: dto.title,
        description: dto.description,
        performedBy: actorUserId,
        activityAt: dto.activityAt ? new Date(dto.activityAt) : undefined,
      },
      include: LEAD_ACTIVITY_INCLUDE,
    });

    return toLeadActivity(activity);
  }

  private async recordActivity(
    leadId: string,
    activityType: LeadActivityType,
    title: string,
    performedBy: string | null,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.leadActivity.create({
      data: { leadId, activityType, title, performedBy, metadata },
    });
  }

  private async assertNoDuplicate(
    phoneNormalized: string | null,
    emailNormalized: string | null,
  ): Promise<void> {
    if (!phoneNormalized && !emailNormalized) {
      return;
    }

    const matchConditions: Prisma.LeadWhereInput[] = [];
    if (phoneNormalized) matchConditions.push({ phoneNormalized });
    if (emailNormalized) matchConditions.push({ emailNormalized });

    const existingLead = await this.prisma.lead.findFirst({
      where: { archivedAt: null, OR: matchConditions },
    });
    if (existingLead) {
      throw new ConflictError(
        `A lead for ${this.displayName(existingLead)} already exists with a matching phone or email.`,
      );
    }

    const contactConditions: Prisma.ContactWhereInput[] = [];
    if (phoneNormalized) contactConditions.push({ phoneNormalized });
    if (emailNormalized) contactConditions.push({ emailNormalized });

    const existingContact = await this.prisma.contact.findFirst({
      where: { archivedAt: null, OR: contactConditions },
    });
    if (existingContact) {
      throw new ConflictError(
        `An existing contact, ${this.displayName(existingContact)}, matches this phone or email.`,
      );
    }
  }

  private displayName(record: { firstName: string; lastName: string | null }): string {
    return record.lastName ? `${record.firstName} ${record.lastName}` : record.firstName;
  }

  private async resolveCompanyForConversion(
    tx: Prisma.TransactionClient,
    lead: PrismaLead,
    dto: ConvertLeadDto,
  ): Promise<string | null> {
    if (dto.companyId) {
      const company = await tx.company.findUnique({ where: { id: dto.companyId } });
      if (!company) {
        throw new NotFoundError('Company not found.');
      }
      return company.id;
    }

    const name = dto.company?.name ?? lead.companyName;
    if (!name) {
      return null;
    }

    const existing = await tx.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, archivedAt: null },
    });
    if (existing) {
      return existing.id;
    }

    const created = await tx.company.create({
      data: {
        name,
        companyType: dto.company?.companyType ?? 'business_customer',
        phone: lead.phone,
        phoneNormalized: lead.phoneNormalized,
        email: lead.email,
        createdBy: lead.createdBy,
      },
    });
    return created.id;
  }

  private async resolveContactForConversion(
    tx: Prisma.TransactionClient,
    lead: PrismaLead,
    dto: ConvertLeadDto,
    companyId: string | null,
  ): Promise<string> {
    if (dto.contactId) {
      const contact = await tx.contact.findUnique({ where: { id: dto.contactId } });
      if (!contact) {
        throw new NotFoundError('Contact not found.');
      }
      return contact.id;
    }

    const matchConditions: Prisma.ContactWhereInput[] = [];
    if (lead.phoneNormalized) matchConditions.push({ phoneNormalized: lead.phoneNormalized });
    if (lead.emailNormalized) matchConditions.push({ emailNormalized: lead.emailNormalized });

    if (matchConditions.length > 0) {
      const existing = await tx.contact.findFirst({
        where: { archivedAt: null, OR: matchConditions },
      });
      if (existing) {
        if (companyId && !existing.companyId) {
          await tx.contact.update({ where: { id: existing.id }, data: { companyId } });
        }
        return existing.id;
      }
    }

    const created = await tx.contact.create({
      data: {
        firstName: dto.contact?.firstName ?? lead.firstName,
        lastName: dto.contact?.lastName ?? lead.lastName,
        phone: lead.phone,
        phoneNormalized: lead.phoneNormalized,
        email: lead.email,
        emailNormalized: lead.emailNormalized,
        companyId,
        ownerId: lead.assignedTo,
        createdBy: lead.createdBy,
      },
    });
    return created.id;
  }
}

/** Re-exported for the controller's response typing. */
export type { LeadWithRelations };
