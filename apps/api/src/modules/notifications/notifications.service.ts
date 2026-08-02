import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Notification, NotificationType, RelatedEntityType } from '@crm/types';
import { NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { PUSH_PROVIDER, type PushProvider } from '../../infrastructure/push/push-provider.interface';
import { ListNotificationsQuery } from './dto/list-notifications.query';
import { toNotification } from './notification.mapper';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUSH_PROVIDER) private readonly pushProvider: PushProvider,
  ) {}

  async list(userId: string, query: ListNotificationsQuery): Promise<ApiCollectionResponse<Notification>> {
    const where: Prisma.NotificationWhereInput = { userId };
    if (query.status === 'unread') where.isRead = false;

    const [rows, totalItems] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: rows.map(toNotification),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markRead(userId: string, id: string): Promise<Notification> {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('Notification not found.');
    }
    if (existing.isRead) {
      return toNotification(existing);
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return toNotification(notification);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Called only by domain-event listeners (`NotificationTriggersListener`),
   * never directly by a controller - ARCHITECTURE.md section 77's
   * "Domain Event -> Notification Service -> In-App Notification". The
   * in-app row is the source of truth; push (MOBILE_ARCHITECTURE.md section
   * 9) is a second, best-effort delivery channel for the same fact - a
   * push failure never undoes or blocks the row already written.
   */
  async create(params: CreateNotificationParams): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    });

    const tokens = await this.prisma.pushToken.findMany({
      where: { session: { userId: params.userId, revokedAt: null } },
    });
    await Promise.allSettled(
      tokens.map((token) =>
        this.pushProvider.send({ expoPushToken: token.expoPushToken, title: params.title, body: params.message }),
      ),
    );
  }

  /** `POST /notifications/push-token` - one row per session (MOBILE_ARCHITECTURE.md section 9). */
  async registerPushToken(sessionId: string, expoPushToken: string, platform: string): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { sessionId },
      create: { sessionId, expoPushToken, platform },
      update: { expoPushToken, platform },
    });
  }
}
