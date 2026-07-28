import { Module } from '@nestjs/common';
import { BillingReportService } from './billing-report.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { InventoryReportService } from './inventory-report.service';
import { LeadsReportService } from './leads-report.service';
import { OutstandingReportService } from './outstanding-report.service';
import { PurchaseReportService } from './purchase-report.service';
import { ReportsController } from './reports.controller';
import { SalesReportService } from './sales-report.service';
import { TeamPerformanceReportService } from './team-performance-report.service';

@Module({
  controllers: [DashboardController, ReportsController],
  providers: [
    DashboardService,
    LeadsReportService,
    SalesReportService,
    InventoryReportService,
    PurchaseReportService,
    BillingReportService,
    OutstandingReportService,
    TeamPerformanceReportService,
  ],
})
export class ReportsModule {}
