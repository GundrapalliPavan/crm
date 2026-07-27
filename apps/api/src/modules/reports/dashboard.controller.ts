import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser, DashboardResponse } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

/**
 * API.md section 108: a purpose-built endpoint, not one the frontend
 * assembles from several list calls. No `@RequirePermission` here - every
 * authenticated user gets a dashboard; which sections it contains is decided
 * per-request from their own permission set (see DashboardService).
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@CurrentUser() actor: AuthenticatedUser): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(actor.id, actor.permissions);
  }
}
