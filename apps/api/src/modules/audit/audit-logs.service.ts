import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, AuditLogEntry } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { ListAuditLogsQuery } from './dto/list-audit-logs.query';
import { AUDIT_LOG_INCLUDE, toAuditLogEntry } from './audit-log.mapper';

/**
 * Read-only query surface over `audit_logs` (DATABASE.md section 99-101) -
 * `AuditService` in `common/audit` remains the only writer. No update or
 * delete method exists here either, matching the same evidentiary
 * immutability: an audit trail that could be edited through its own viewer
 * would not be much of a trail.
 */
@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAuditLogsQuery): Promise<ApiCollectionResponse<AuditLogEntry>> {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.actorUserId) where.actorUserId = query.actorUserId;
    if (query.action) where.action = query.action;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setUTCDate(to.getUTCDate() + 1);
        where.createdAt.lt = to;
      }
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: AUDIT_LOG_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: rows.map(toAuditLogEntry),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }
}
