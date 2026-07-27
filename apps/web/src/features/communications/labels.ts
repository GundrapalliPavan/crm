import type { CommunicationChannel, CommunicationStatus, TemplateStatus } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

const CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
};

export function communicationChannelLabel(channel: CommunicationChannel): string {
  return CHANNEL_LABELS[channel];
}

const STATUS_LABELS: Record<CommunicationStatus, string> = {
  draft: 'Draft',
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
};

export function communicationStatusLabel(status: CommunicationStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_TONES: Record<CommunicationStatus, BadgeTone> = {
  draft: 'neutral',
  queued: 'warning',
  sending: 'warning',
  sent: 'success',
  delivered: 'success',
  read: 'success',
  failed: 'critical',
};

export function communicationStatusTone(status: CommunicationStatus): BadgeTone {
  return STATUS_TONES[status];
}

const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
};

export function templateStatusLabel(status: TemplateStatus): string {
  return TEMPLATE_STATUS_LABELS[status];
}

const TEMPLATE_STATUS_TONES: Record<TemplateStatus, BadgeTone> = {
  draft: 'neutral',
  active: 'success',
  inactive: 'critical',
};

export function templateStatusTone(status: TemplateStatus): BadgeTone {
  return TEMPLATE_STATUS_TONES[status];
}
