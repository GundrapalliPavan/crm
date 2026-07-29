import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { RequestContextService } from '../request-context/request-context.service';

export interface AuditEntry {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Writes administrative/security history (DATABASE.md section 99).
 *
 * Deliberately append-only: there is no update or delete method, matching the
 * evidentiary nature of an audit record (section 101). The request ID,
 * caller IP and user agent are attached automatically from the ambient
 * request context, so an audited change can be traced back to the exact API
 * call that caused it (Step 4 section 50) without every call site having to
 * thread them through.
 */
@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContext: RequestContextService,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        beforeData: entry.beforeData,
        afterData: entry.afterData,
        metadata: entry.metadata,
        requestId: this.requestContext.requestId,
        ipAddress: this.requestContext.ipAddress,
        userAgent: this.requestContext.userAgent,
      },
    });
  }
}
