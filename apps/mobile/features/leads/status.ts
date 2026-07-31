import type { LeadLostReason, LeadPriority, LeadStatus, LeadType } from '@crm/types';

/** Classify by meaning, not one color per status value - mirrors apps/web/src/features/leads/status.ts's tone grouping, using hex values since mobile has no Badge/tone system yet. */
const STATUS_COLOR: Record<LeadStatus, string> = {
  new: '#64748b',
  attempted_contact: '#64748b',
  connected: '#64748b',
  qualified: '#2563eb',
  opportunity: '#2563eb',
  converted: '#16a34a',
  lost: '#dc2626',
  unqualified: '#64748b',
  duplicate: '#64748b',
};

const PRIORITY_COLOR: Record<LeadPriority, string> = {
  low: '#64748b',
  medium: '#64748b',
  high: '#d97706',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function leadStatusColor(status: LeadStatus): string {
  return STATUS_COLOR[status];
}

export function leadStatusLabel(status: LeadStatus): string {
  return toTitleCase(status);
}

export function leadPriorityColor(priority: LeadPriority): string {
  return PRIORITY_COLOR[priority];
}

export function leadPriorityLabel(priority: LeadPriority): string {
  return toTitleCase(priority);
}

export function leadTypeLabel(leadType: LeadType): string {
  return toTitleCase(leadType);
}

export function lostReasonLabel(reason: LeadLostReason): string {
  return toTitleCase(reason);
}
