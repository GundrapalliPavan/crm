import type { LeadLostReason, LeadPriority, LeadStatus, LeadType } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

/** COLORS.md sections 21-27: classify by meaning, not one color per status value. */
const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: 'neutral',
  attempted_contact: 'neutral',
  connected: 'neutral',
  qualified: 'info',
  opportunity: 'info',
  converted: 'success',
  lost: 'critical',
  unqualified: 'neutral',
  duplicate: 'neutral',
};

const PRIORITY_TONE: Record<LeadPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'neutral',
  high: 'warning',
};

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function leadStatusTone(status: LeadStatus): BadgeTone {
  return STATUS_TONE[status];
}

export function leadStatusLabel(status: LeadStatus): string {
  return toTitleCase(status);
}

export function leadPriorityTone(priority: LeadPriority): BadgeTone {
  return PRIORITY_TONE[priority];
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
