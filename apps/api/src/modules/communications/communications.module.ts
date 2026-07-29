import { Module } from '@nestjs/common';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';

@Module({
  imports: [MessagingModule],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
})
export class CommunicationsModule {}
