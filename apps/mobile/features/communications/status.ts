import type { CommunicationChannel, CommunicationDirection, CommunicationStatus } from '@crm/types';

/** Mirrors features/quotations/status.ts's tone-grouping approach. */
const STATUS_COLOR: Record<CommunicationStatus, string> = {
  draft: '#64748b',
  queued: '#d97706',
  sending: '#d97706',
  sent: '#2563eb',
  delivered: '#2563eb',
  read: '#16a34a',
  failed: '#dc2626',
};

const CHANNEL_LABEL: Record<CommunicationChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function communicationStatusColor(status: CommunicationStatus): string {
  return STATUS_COLOR[status];
}

export function communicationStatusLabel(status: CommunicationStatus): string {
  return toTitleCase(status);
}

export function communicationChannelLabel(channel: CommunicationChannel): string {
  return CHANNEL_LABEL[channel];
}

export function communicationDirectionLabel(direction: CommunicationDirection): string {
  return direction === 'outbound' ? 'Sent' : 'Received';
}
