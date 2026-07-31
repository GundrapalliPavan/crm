import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, FollowUp } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { BusinessRuleError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CheckInFollowUpDto } from './dto/check-in-follow-up.dto';
import { CompleteFollowUpDto } from './dto/complete-follow-up.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { ListFollowUpsQuery } from './dto/list-follow-ups.query';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FOLLOW_UP_INCLUDE, toFollowUp } from './follow-up.mapper';

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListFollowUpsQuery): Promise<ApiCollectionResponse<FollowUp>> {
    const where: Prisma.FollowUpWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.leadId) where.leadId = query.leadId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.companyId) where.companyId = query.companyId;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    if (query.overdue) {
      where.status = 'pending';
      where.scheduledAt = { lt: new Date() };
    } else if (query.dateFrom || query.dateTo) {
      where.scheduledAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.followUp.findMany({
        where,
        include: FOLLOW_UP_INCLUDE,
        orderBy: { scheduledAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return {
      data: rows.map(toFollowUp),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  /** API.md section 45 - avoids clients manually filtering the unrestricted collection. */
  listMine(userId: string, query: ListFollowUpsQuery): Promise<ApiCollectionResponse<FollowUp>> {
    return this.list({ ...query, assignedTo: userId });
  }

  async getById(id: string): Promise<FollowUp> {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
      include: FOLLOW_UP_INCLUDE,
    });
    if (!followUp) {
      throw new NotFoundError('Follow-up not found.');
    }
    return toFollowUp(followUp);
  }

  async create(dto: CreateFollowUpDto, actorUserId: string): Promise<FollowUp> {
    if (!dto.leadId && !dto.contactId && !dto.companyId) {
      throw new ValidationError({
        leadId: ['A follow-up must relate to a lead, contact or company.'],
      });
    }

    const followUp = await this.prisma.followUp.create({
      data: {
        leadId: dto.leadId,
        contactId: dto.contactId,
        companyId: dto.companyId,
        assignedTo: dto.assignedTo,
        followUpType: dto.followUpType,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
        createdBy: actorUserId,
      },
      include: FOLLOW_UP_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'follow_up.created',
      entityType: 'follow_up',
      entityId: followUp.id,
      afterData: { followUpType: followUp.followUpType, assignedTo: followUp.assignedTo },
    });

    return toFollowUp(followUp);
  }

  async update(id: string, dto: UpdateFollowUpDto, actorUserId: string): Promise<FollowUp> {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Follow-up not found.');
    }

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: {
        assignedTo: dto.assignedTo,
        followUpType: dto.followUpType,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        notes: dto.notes,
      },
      include: FOLLOW_UP_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'follow_up.updated',
      entityType: 'follow_up',
      entityId: id,
      beforeData: { assignedTo: existing.assignedTo, scheduledAt: existing.scheduledAt.toISOString() },
      afterData: { assignedTo: followUp.assignedTo, scheduledAt: followUp.scheduledAt.toISOString() },
    });

    return toFollowUp(followUp);
  }

  /**
   * MOBILE_ARCHITECTURE.md section 6, Option A - only meaningful for a
   * `visit`-type follow-up: records where/when the rep physically arrived.
   * Not a status transition (stays `pending`) - checkout still happens via
   * the normal `complete` call below.
   */
  async checkIn(id: string, dto: CheckInFollowUpDto, actorUserId: string): Promise<FollowUp> {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Follow-up not found.');
    }
    if (existing.followUpType !== 'visit') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a visit follow-up can be checked in.');
    }
    if (existing.status !== 'pending') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a pending visit can be checked in.');
    }
    if (existing.checkInAt) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This visit has already been checked in.');
    }

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: {
        checkInAt: new Date(),
        checkInLatitude: dto.latitude,
        checkInLongitude: dto.longitude,
      },
      include: FOLLOW_UP_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'follow_up.checked_in',
      entityType: 'follow_up',
      entityId: id,
    });

    return toFollowUp(followUp);
  }

  /**
   * CRM.md section 27: outcome + optional note + optional next follow-up, in
   * one call, so completing today's work naturally schedules tomorrow's.
   */
  async complete(id: string, dto: CompleteFollowUpDto, actorUserId: string): Promise<FollowUp> {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Follow-up not found.');
    }
    if (existing.status !== 'pending') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a pending follow-up can be completed.');
    }
    if (existing.followUpType === 'visit' && !existing.checkInAt) {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'A visit must be checked in before it can be completed.');
    }

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        outcome: dto.outcome,
        notes: dto.notes ?? existing.notes,
        checkOutAt: existing.followUpType === 'visit' ? new Date() : undefined,
        checkOutLatitude: existing.followUpType === 'visit' ? dto.checkOutLatitude : undefined,
        checkOutLongitude: existing.followUpType === 'visit' ? dto.checkOutLongitude : undefined,
      },
      include: FOLLOW_UP_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'follow_up.completed',
      entityType: 'follow_up',
      entityId: id,
      afterData: { outcome: followUp.outcome },
    });

    if (dto.nextFollowUp) {
      await this.create(
        {
          leadId: dto.nextFollowUp.leadId ?? existing.leadId ?? undefined,
          contactId: dto.nextFollowUp.contactId ?? existing.contactId ?? undefined,
          companyId: dto.nextFollowUp.companyId ?? existing.companyId ?? undefined,
          assignedTo: dto.nextFollowUp.assignedTo,
          followUpType: dto.nextFollowUp.followUpType,
          scheduledAt: dto.nextFollowUp.scheduledAt,
          notes: dto.nextFollowUp.notes,
        },
        actorUserId,
      );
    }

    return toFollowUp(followUp);
  }

  async cancel(id: string, actorUserId: string): Promise<FollowUp> {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Follow-up not found.');
    }
    if (existing.status !== 'pending') {
      throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'Only a pending follow-up can be cancelled.');
    }

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: { status: 'cancelled' },
      include: FOLLOW_UP_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'follow_up.cancelled',
      entityType: 'follow_up',
      entityId: id,
    });

    return toFollowUp(followUp);
  }
}
