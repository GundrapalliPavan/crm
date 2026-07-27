import { Module } from '@nestjs/common';
import { COMMUNICATION_PROVIDER } from '../../infrastructure/messaging/communication-provider.interface';
import { UnconfiguredCommunicationProvider } from '../../infrastructure/messaging/unconfigured-communication.provider';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';

@Module({
  controllers: [CommunicationsController],
  providers: [
    CommunicationsService,
    // Swap this binding for a real provider once one is chosen - nothing
    // else in this module changes (CLAUDE.md sections 25-27).
    { provide: COMMUNICATION_PROVIDER, useClass: UnconfiguredCommunicationProvider },
  ],
})
export class CommunicationsModule {}
