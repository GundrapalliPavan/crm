/**
 * Audit domain contracts (DATABASE.md sections 99-102, ARCHITECTURE.md
 * sections 60-61, PROJECT.md section 48).
 *
 * Read-only surface over the `audit_logs` table that `AuditService.record()`
 * (apps/api/src/common/audit/audit.service.ts) has been writing to since
 * Step 4 - this module adds the first way to actually query that history:
 * who did something, when, and what changed, across every module that calls
 * it. Distinct from the per-entity Communication log (DATABASE.md section
 * 102: "Activity vs Audit... do not force both purposes into one table") -
 * this is system-level traceability, not a business-facing timeline.
 */

export interface AuditActorSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  /** Null when the acting user's account has since been deleted (DATABASE.md: the link is severed, not the evidence) - or for a system action with no human actor. */
  actor: AuditActorSummary | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ListAuditLogsQuery {
  page?: number;
  pageSize?: number;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}
