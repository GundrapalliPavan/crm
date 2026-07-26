import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

/**
 * Global so any module - not just `AppModule`, which previously provided this
 * locally - can inject `RequestContextService`. `AuditService` needs it to
 * stamp audit rows with the request ID (Step 4 section 50).
 */
@Global()
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}
