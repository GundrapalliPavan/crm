import type { CommunicationTemplate as PrismaCommunicationTemplate } from '@prisma/client';
import type { CommunicationTemplate } from '@crm/types';

export function toCommunicationTemplate(template: PrismaCommunicationTemplate): CommunicationTemplate {
  return {
    id: template.id,
    name: template.name,
    channel: template.channel,
    purpose: template.purpose,
    subjectTemplate: template.subjectTemplate,
    bodyTemplate: template.bodyTemplate,
    providerTemplateId: template.providerTemplateId,
    languageCode: template.languageCode,
    status: template.status,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}
