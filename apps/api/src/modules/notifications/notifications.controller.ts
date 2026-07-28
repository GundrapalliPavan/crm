import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Notification, UnreadCountResponse } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListNotificationsQuery } from './dto/list-notifications.query';
import { NotificationsService } from './notifications.service';

/**
 * API.md sections 100-101. No `@RequirePermission` - every authenticated
 * user manages only their own notifications, same precedent as `/dashboard`.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @Query() query: ListNotificationsQuery,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ApiCollectionResponse<Notification>> {
    return this.notificationsService.list(actor.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() actor: AuthenticatedUser): Promise<UnreadCountResponse> {
    return this.notificationsService.getUnreadCount(actor.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/read')
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Notification> {
    return this.notificationsService.markRead(actor.id, id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('read-all')
  markAllRead(@CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.notificationsService.markAllRead(actor.id);
  }
}
