/**
 * In-App Notifications (platform capability - PROJECT.md section 26,
 * technical/API.md sections 100-101, technical/ARCHITECTURE.md sections
 * 76-80, technical/DATABASE.md sections 97-98).
 *
 * `Notification` existed in the schema since Phase 0 and was completely
 * unused - no migration was needed. Notifications are created by internal
 * domain-event listeners (ARCHITECTURE.md section 77: "Domain Event ->
 * Notification Service -> In-App Notification"), not called directly by
 * business modules, so a business action never fails because notification
 * delivery failed.
 *
 * Scope for this pass: five trigger events that are pure, synchronous
 * reactions to a user action - Lead Assigned, Quotation Approval Required
 * (only when a discount pushes it into approval_pending), Purchase Order
 * Approval Required, Payment Received, and Low Stock (checked after
 * adjustments/transfers, using the existing `minimumStockLevel` field).
 * Follow-up Due and Invoice Overdue are explicitly deferred - both are
 * genuinely time-based rather than action-triggered, so they need a real
 * scheduled job, which is new infrastructure and its own decision. Task
 * Assigned and Support Escalation are deferred - neither Tasks nor Customer
 * Service have schema yet. External notification channels (Email, WhatsApp,
 * SMS, Web/Mobile Push) are explicitly deferred - PROJECT.md frames them as
 * "potential channels," and Communication (Module 8) already established
 * that no real provider exists yet.
 */

import type { RelatedEntityType } from './communication';

export const NOTIFICATION_TYPES = [
  'lead_assigned',
  'quotation_approval_required',
  'purchase_order_approval_required',
  'payment_received',
  'low_stock',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ListNotificationsQuery {
  page?: number;
  pageSize?: number;
  /** API.md section 100's `?status=unread` example. Omitted returns all. */
  status?: 'unread';
}

export interface UnreadCountResponse {
  count: number;
}
