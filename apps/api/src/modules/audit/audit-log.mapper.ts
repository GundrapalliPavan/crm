import type { Prisma } from '@prisma/client';
import type { AuditLogEntry } from '@crm/types';

export const AUDIT_LOG_INCLUDE = {
  actor: { select: { id: true, firstName: true, lastName: true, email: true } },
} as const;

type AuditLogWithActor = Prisma.AuditLogGetPayload<{ include: typeof AUDIT_LOG_INCLUDE }>;

/** `Json?` columns arrive typed `JsonValue`, but a snapshot recorded by `AuditService.record()` is always a plain object or `null` - never a bare string/number/array. */
function toJsonRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function toAuditLogEntry(row: AuditLogWithActor): AuditLogEntry {
  return {
    id: row.id,
    actor: row.actor
      ? { id: row.actor.id, firstName: row.actor.firstName, lastName: row.actor.lastName, email: row.actor.email }
      : null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    beforeData: toJsonRecord(row.beforeData),
    afterData: toJsonRecord(row.afterData),
    metadata: toJsonRecord(row.metadata),
    requestId: row.requestId,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
  };
}
