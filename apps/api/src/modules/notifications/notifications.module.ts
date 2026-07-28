import { Module } from '@nestjs/common';
import { NotificationTriggersListener } from './notification-triggers.listener';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationTriggersListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
