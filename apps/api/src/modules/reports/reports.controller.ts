import { Controller, Get, Header, Query } from '@nestjs/common';
import type {
  BillingReportResponse,
  InventoryReportResponse,
  LeadsReportResponse,
  OutstandingReportResponse,
  PurchaseReportResponse,
  SalesReportResponse,
} from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { BillingReportQuery } from './dto/billing-report.query';
import { InventoryReportQuery } from './dto/inventory-report.query';
import { LeadsReportQuery } from './dto/leads-report.query';
import { OutstandingReportQuery } from './dto/outstanding-report.query';
import { PurchaseReportQuery } from './dto/purchase-report.query';
import { SalesReportQuery } from './dto/sales-report.query';
import { BillingReportService } from './billing-report.service';
import { InventoryReportService } from './inventory-report.service';
import { LeadsReportService } from './leads-report.service';
import { OutstandingReportService } from './outstanding-report.service';
import { PurchaseReportService } from './purchase-report.service';
import { SalesReportService } from './sales-report.service';

/** API.md sections 106-107, 111. Dedicated read endpoints per domain, each with a sync CSV export. */
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly leadsReportService: LeadsReportService,
    private readonly salesReportService: SalesReportService,
    private readonly inventoryReportService: InventoryReportService,
    private readonly purchaseReportService: PurchaseReportService,
    private readonly billingReportService: BillingReportService,
    private readonly outstandingReportService: OutstandingReportService,
  ) {}

  @RequirePermission('report.view')
  @Get('leads')
  getLeadsReport(@Query() query: LeadsReportQuery): Promise<LeadsReportResponse> {
    return this.leadsReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('leads/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="leads-report.csv"')
  getLeadsReportCsv(@Query() query: LeadsReportQuery): Promise<string> {
    return this.leadsReportService.getReportCsv(query);
  }

  @RequirePermission('report.view')
  @Get('sales')
  getSalesReport(@Query() query: SalesReportQuery): Promise<SalesReportResponse> {
    return this.salesReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('sales/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="sales-report.csv"')
  getSalesReportCsv(@Query() query: SalesReportQuery): Promise<string> {
    return this.salesReportService.getReportCsv(query);
  }

  @RequirePermission('report.view')
  @Get('inventory')
  getInventoryReport(@Query() query: InventoryReportQuery): Promise<InventoryReportResponse> {
    return this.inventoryReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('inventory/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="inventory-report.csv"')
  getInventoryReportCsv(@Query() query: InventoryReportQuery): Promise<string> {
    return this.inventoryReportService.getReportCsv(query);
  }

  @RequirePermission('report.view')
  @Get('purchases')
  getPurchaseReport(@Query() query: PurchaseReportQuery): Promise<PurchaseReportResponse> {
    return this.purchaseReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('purchases/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="purchase-report.csv"')
  getPurchaseReportCsv(@Query() query: PurchaseReportQuery): Promise<string> {
    return this.purchaseReportService.getReportCsv(query);
  }

  @RequirePermission('report.view')
  @Get('billing')
  getBillingReport(@Query() query: BillingReportQuery): Promise<BillingReportResponse> {
    return this.billingReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('billing/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="billing-report.csv"')
  getBillingReportCsv(@Query() query: BillingReportQuery): Promise<string> {
    return this.billingReportService.getReportCsv(query);
  }

  @RequirePermission('report.view')
  @Get('outstanding')
  getOutstandingReport(@Query() query: OutstandingReportQuery): Promise<OutstandingReportResponse> {
    return this.outstandingReportService.getReport(query);
  }

  @RequirePermission('report.export')
  @Get('outstanding/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="outstanding-report.csv"')
  getOutstandingReportCsv(@Query() query: OutstandingReportQuery): Promise<string> {
    return this.outstandingReportService.getReportCsv(query);
  }
}
