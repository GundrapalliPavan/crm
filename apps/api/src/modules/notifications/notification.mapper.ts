import type { Notification as PrismaNotification } from '@prisma/client';
import type { Notification } from '@crm/types';

export function toNotification(notification: PrismaNotification): Notification {
  return {
    id: notification.id,
    type: notification.type as Notification['type'],
    title: notification.title,
    message: notification.message,
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  };
}
