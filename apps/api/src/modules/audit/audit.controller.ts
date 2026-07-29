import { Controller, Get, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuditLogEntry } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ListAuditLogsQuery } from './dto/list-audit-logs.query';
import { AuditLogsService } from './audit-logs.service';

/** `audit.read` is Administrator-only by default (prisma/seed.ts) - no other role is granted it. */
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @RequirePermission('audit.read')
  @Get()
  list(@Query() query: ListAuditLogsQuery): Promise<ApiCollectionResponse<AuditLogEntry>> {
    return this.auditLogsService.list(query);
  }
}
