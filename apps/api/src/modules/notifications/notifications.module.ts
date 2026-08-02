import { Module } from '@nestjs/common';
import { PushModule } from '../../infrastructure/push/push.module';
import { NotificationTriggersListener } from './notification-triggers.listener';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PushModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationTriggersListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
