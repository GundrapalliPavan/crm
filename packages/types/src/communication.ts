/**
 * Communication module contracts (Module 8 - PROJECT.md sections 20-27,
 * technical/API.md sections 84-93, technical/DATABASE.md sections 82-92).
 *
 * Scope for this pass: Communications (send/record, either from an approved
 * template with variable substitution or ad-hoc) and Communication Templates
 * - the centralized log behind the Unified Communication Timeline. No real
 * WhatsApp/Email/SMS provider exists yet (infrastructure/messaging and
 * infrastructure/email are still empty placeholders), so sending honestly
 * records the attempt and marks it `failed` with a clear reason rather than
 * faking delivery or leaving it `queued` forever with nothing to progress
 * it - see the `CommunicationProvider` abstraction in the API. Real provider
 * integration, webhooks, in-app Notifications (a separate, equally unused
 * schema model - wiring real trigger points touches every other module's
 * service layer, which is its own pass), Calling and Automation are
 * explicitly deferred.
 */

export const COMMUNICATION_CHANNELS = ['whatsapp', 'email', 'sms'] as const;
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_DIRECTIONS = ['outbound', 'inbound'] as const;
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number];

export const COMMUNICATION_STATUSES = ['draft', 'queued', 'sending', 'sent', 'delivered', 'read', 'failed'] as const;
export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];

export const TEMPLATE_STATUSES = ['draft', 'active', 'inactive'] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

/** DATABASE.md section 87 - the entity types a communication may attach to (a deliberate polymorphic link; integrity is enforced in the application layer). */
export const RELATED_ENTITY_TYPES = [
  'lead',
  'contact',
  'company',
  'quotation',
  'sales_order',
  'purchase_order',
  'goods_receipt',
  'invoice',
  'payment',
  'product',
] as const;
export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number];

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  purpose: string;
  subjectTemplate: string | null;
  bodyTemplate: string;
  providerTemplateId: string | null;
  languageCode: string;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunicationTemplateRequest {
  name: string;
  channel: CommunicationChannel;
  purpose: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  providerTemplateId?: string;
  languageCode?: string;
  status?: TemplateStatus;
}

export type UpdateCommunicationTemplateRequest = Partial<CreateCommunicationTemplateRequest>;

export interface ListCommunicationTemplatesQuery {
  page?: number;
  pageSize?: number;
  channel?: CommunicationChannel;
  status?: TemplateStatus;
}

export interface Communication {
  id: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  sender: string | null;
  recipient: string;
  subject: string | null;
  messageBody: string | null;
  template: { id: string; name: string } | null;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
  failureReason: string | null;
  queuedAt: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

/** Either `templateId` + `variables` (substituted into the template's placeholders) or ad-hoc `subject`/`messageBody` - not both. */
export interface CreateCommunicationRequest {
  channel: CommunicationChannel;
  recipient: string;
  templateId?: string;
  variables?: Record<string, string>;
  subject?: string;
  messageBody?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export interface ListCommunicationsQuery {
  page?: number;
  pageSize?: number;
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  dateFrom?: string;
  dateTo?: string;
}
