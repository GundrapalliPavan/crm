import type { Communication as PrismaCommunication, CommunicationTemplate } from '@prisma/client';
import type { Communication } from '@crm/types';

type TemplateRef = Pick<CommunicationTemplate, 'id' | 'name'>;

export const COMMUNICATION_INCLUDE = {
  template: { select: { id: true, name: true } },
} as const;

export type CommunicationWithRelations = PrismaCommunication & { template: TemplateRef | null };

export function toCommunication(communication: CommunicationWithRelations): Communication {
  return {
    id: communication.id,
    channel: communication.channel,
    direction: communication.direction,
    status: communication.status,
    sender: communication.sender,
    recipient: communication.recipient,
    subject: communication.subject,
    messageBody: communication.messageBody,
    template: communication.template,
    relatedEntityType: communication.relatedEntityType,
    relatedEntityId: communication.relatedEntityId,
    failureReason: communication.failureReason,
    queuedAt: communication.queuedAt?.toISOString() ?? null,
    sentAt: communication.sentAt?.toISOString() ?? null,
    deliveredAt: communication.deliveredAt?.toISOString() ?? null,
    readAt: communication.readAt?.toISOString() ?? null,
    failedAt: communication.failedAt?.toISOString() ?? null,
    createdAt: communication.createdAt.toISOString(),
  };
}
