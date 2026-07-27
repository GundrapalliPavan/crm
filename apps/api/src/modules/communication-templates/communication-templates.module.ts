import { Module } from '@nestjs/common';
import { CommunicationTemplatesController } from './communication-templates.controller';
import { CommunicationTemplatesService } from './communication-templates.service';

@Module({
  controllers: [CommunicationTemplatesController],
  providers: [CommunicationTemplatesService],
  exports: [CommunicationTemplatesService],
})
export class CommunicationTemplatesModule {}
