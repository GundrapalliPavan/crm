import { Injectable } from '@nestjs/common';
import { Prisma, type InvoiceStatus, type LeadStatus, type PurchaseOrderStatus } from '@prisma/client';
import type { DashboardResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';

/** Leads still active in the pipeline - not yet converted or closed out (CRM.md's terminal statuses). */
const OPEN_LEAD_STATUSES: LeadStatus[] = ['new', 'attempted_contact', 'connected', 'qualified', 'opportunity'];
const OPEN_PURCHASE_ORDER_STATUSES: PurchaseOrderStatus[] = ['sent', 'supplier_confirmed', 'partially_received'];
const OUTSTANDING_INVOICE_STATUSES: InvoiceStatus[] = ['issued', 'partially_paid'];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * API.md sections 108-110: one purpose-built endpoint, not the frontend
   * calculating metrics from list endpoints. Each section is included only
   * when the caller's own permissions unlock that domain - not branched on
   * role name (CLAUDE.md section 21) - so a Sales Executive naturally sees
   * "My Leads"/"My Sales" while an Administrator sees every section.
   */
  async getDashboard(actorId: string, permissions: string[]): Promise<DashboardResponse> {
    const has = (code: string) => permissions.includes(code);
    const response: DashboardResponse = {};

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    if (has('lead.read')) {
      const [totalOpen, myOpen, newThisWeek, createdThisMonth, convertedThisMonth] = await Promise.all([
        this.prisma.lead.count({ where: { status: { in: OPEN_LEAD_STATUSES } } }),
        this.prisma.lead.count({ where: { status: { in: OPEN_LEAD_STATUSES }, assignedTo: actorId } }),
        this.prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
        this.prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
        this.prisma.lead.count({ where: { createdAt: { gte: monthStart }, status: 'converted' } }),
      ]);

      response.leads = {
        totalOpen,
        myOpen,
        newThisWeek,
        conversionRateThisMonth: conversionRate(convertedThisMonth, createdThisMonth),
      };
    }

    if (has('quotation.read') && has('sales_order.read')) {
      const [quotationsPendingApproval, myQuotationsPendingApproval, confirmedOrders] = await Promise.all([
        this.prisma.quotation.count({ where: { status: 'approval_pending' } }),
        this.prisma.quotation.count({ where: { status: 'approval_pending', ownerId: actorId } }),
        this.prisma.salesOrder.findMany({
          where: { confirmedAt: { gte: monthStart } },
          select: { totalAmount: true },
        }),
      ]);

      response.sales = {
        quotationsPendingApproval,
        myQuotationsPendingApproval,
        confirmedOrdersThisMonth: confirmedOrders.length,
        revenueThisMonth: confirmedOrders
          .reduce((sum, order) => sum.plus(order.totalAmount), new Prisma.Decimal(0))
          .toString(),
      };
    }

    if (has('purchase_order.read')) {
      const [pendingApprovalCount, openPurchaseOrderCount] = await Promise.all([
        this.prisma.purchaseOrder.count({ where: { status: 'approval_pending' } }),
        this.prisma.purchaseOrder.count({ where: { status: { in: OPEN_PURCHASE_ORDER_STATUSES } } }),
      ]);

      response.purchase = { pendingApprovalCount, openPurchaseOrderCount };
    }

    if (has('inventory.read')) {
      const [{ count }] = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM inventory_balances ib
        INNER JOIN products p ON p.id = ib.product_id
        WHERE p.minimum_stock_level IS NOT NULL
          AND (ib.on_hand_quantity - ib.reserved_quantity) <= p.minimum_stock_level
      `;
      response.inventory = { lowStockCount: Number(count) };
    }

    if (has('invoice.read')) {
      const [outstandingAggregate, overdueInvoiceCount] = await Promise.all([
        this.prisma.invoice.aggregate({
          where: { status: { in: OUTSTANDING_INVOICE_STATUSES } },
          _sum: { outstandingAmount: true },
        }),
        this.prisma.invoice.count({
          where: { status: { in: OUTSTANDING_INVOICE_STATUSES }, dueDate: { lt: now } },
        }),
      ]);

      response.billing = {
        totalOutstanding: new Prisma.Decimal(outstandingAggregate._sum?.outstandingAmount ?? 0).toString(),
        overdueInvoiceCount,
      };
    }

    return response;
  }
}

function conversionRate(converted: number, total: number): string {
  if (total === 0) {
    return '0';
  }
  return new Prisma.Decimal(converted).dividedBy(total).times(100).toDecimalPlaces(2).toString();
}
