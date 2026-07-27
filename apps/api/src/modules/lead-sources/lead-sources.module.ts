import { Module } from '@nestjs/common';
import { LeadSourcesController } from './lead-sources.controller';

@Module({
  controllers: [LeadSourcesController],
})
export class LeadSourcesModule {}
