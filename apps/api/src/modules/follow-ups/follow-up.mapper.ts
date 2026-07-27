import type { FollowUp as PrismaFollowUp, User } from '@prisma/client';
import type { FollowUp } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const FOLLOW_UP_INCLUDE = {
  assignee: { select: { id: true, firstName: true, lastName: true } },
} as const;

export type FollowUpWithRelations = PrismaFollowUp & { assignee: UserRef };

/** DATABASE.md section 30: overdue is derived from scheduledAt + status, never persisted. */
export function toFollowUp(followUp: FollowUpWithRelations): FollowUp {
  const isOverdue = followUp.status === 'pending' && followUp.scheduledAt.getTime() < Date.now();

  return {
    id: followUp.id,
    leadId: followUp.leadId,
    contactId: followUp.contactId,
    companyId: followUp.companyId,
    assignee: followUp.assignee,
    followUpType: followUp.followUpType,
    scheduledAt: followUp.scheduledAt.toISOString(),
    status: followUp.status,
    isOverdue,
    notes: followUp.notes,
    outcome: followUp.outcome,
    completedAt: followUp.completedAt?.toISOString() ?? null,
    createdAt: followUp.createdAt.toISOString(),
  };
}
