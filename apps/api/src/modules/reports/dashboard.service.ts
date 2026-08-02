import { Injectable } from '@nestjs/common';
import { Prisma, type InvoiceStatus, type LeadStatus, type PurchaseOrderStatus } from '@prisma/client';
import type { DashboardResponse, RecentActivityItem } from '@crm/types';
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
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    if (has('follow_up.read')) {
      const [dueToday, overdue, items] = await Promise.all([
        this.prisma.followUp.count({
          where: { assignedTo: actorId, status: 'pending', scheduledAt: { gte: todayStart, lt: todayEnd } },
        }),
        this.prisma.followUp.count({
          where: { assignedTo: actorId, status: 'pending', scheduledAt: { lt: todayStart } },
        }),
        this.prisma.followUp.findMany({
          where: { assignedTo: actorId, status: 'pending', scheduledAt: { lt: todayEnd } },
          select: {
            id: true,
            leadId: true,
            contactId: true,
            companyId: true,
            followUpType: true,
            scheduledAt: true,
            lead: { select: { firstName: true, lastName: true } },
            contact: { select: { firstName: true, lastName: true } },
            company: { select: { name: true } },
          },
          orderBy: { scheduledAt: 'asc' },
          take: 5,
        }),
      ]);

      response.followUps = {
        dueToday,
        overdue,
        items: items.map((item) => ({
          id: item.id,
          entityLabel: entityLabel(item),
          leadId: item.leadId,
          contactId: item.contactId,
          companyId: item.companyId,
          followUpType: item.followUpType,
          scheduledAt: item.scheduledAt.toISOString(),
          isOverdue: item.scheduledAt < todayStart,
        })),
      };
    }

    if (has('follow_up.read')) {
      const visits = await this.prisma.followUp.findMany({
        where: { assignedTo: actorId, followUpType: 'visit', scheduledAt: { gte: todayStart, lt: todayEnd } },
        select: {
          id: true,
          leadId: true,
          contactId: true,
          companyId: true,
          scheduledAt: true,
          checkInAt: true,
          checkOutAt: true,
          lead: { select: { firstName: true, lastName: true } },
          contact: { select: { firstName: true, lastName: true } },
          company: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      response.visits = {
        items: visits.map((visit) => ({
          id: visit.id,
          entityLabel: entityLabel(visit),
          leadId: visit.leadId,
          contactId: visit.contactId,
          companyId: visit.companyId,
          scheduledAt: visit.scheduledAt.toISOString(),
          checkInAt: visit.checkInAt?.toISOString() ?? null,
          checkOutAt: visit.checkOutAt?.toISOString() ?? null,
        })),
      };
    }

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

    if (has('lead.read') || has('follow_up.read') || has('quotation.read')) {
      response.recentActivity = { items: await this.buildRecentActivity(actorId, has) };
    }

    return response;
  }

  /**
   * A bounded, cheap "what have I been doing" feed - three small queries
   * scoped to the actor, each gated on the same read permission its own
   * dashboard section already requires. Deliberately not backed by the
   * admin-only /audit-logs endpoint (different purpose, different
   * permission gate) and not a new generic event/activity-log table
   * (CLAUDE.md section 29 - avoid event infrastructure without a
   * demonstrated requirement).
   */
  private async buildRecentActivity(
    actorId: string,
    has: (code: string) => boolean,
  ): Promise<RecentActivityItem[]> {
    const items: RecentActivityItem[] = [];

    if (has('lead.read')) {
      const leads = await this.prisma.lead.findMany({
        where: { assignedTo: actorId },
        select: { id: true, firstName: true, lastName: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });
      items.push(
        ...leads.map((lead) => ({
          id: lead.id,
          entityType: 'lead' as const,
          entityId: lead.id,
          label: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
          description: 'Lead updated',
          occurredAt: lead.updatedAt.toISOString(),
        })),
      );
    }

    if (has('follow_up.read')) {
      const completedVisits = await this.prisma.followUp.findMany({
        where: { assignedTo: actorId, followUpType: 'visit', checkOutAt: { not: null } },
        select: {
          id: true,
          checkOutAt: true,
          lead: { select: { firstName: true, lastName: true } },
          contact: { select: { firstName: true, lastName: true } },
          company: { select: { name: true } },
        },
        orderBy: { checkOutAt: 'desc' },
        take: 5,
      });
      items.push(
        ...completedVisits.map((visit) => ({
          id: visit.id,
          entityType: 'visit' as const,
          entityId: visit.id,
          label: entityLabel(visit),
          description: 'Visit completed',
          occurredAt: visit.checkOutAt!.toISOString(),
        })),
      );
    }

    if (has('quotation.read')) {
      const quotations = await this.prisma.quotation.findMany({
        where: { ownerId: actorId },
        select: { id: true, quotationNumber: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      items.push(
        ...quotations.map((quotation) => ({
          id: quotation.id,
          entityType: 'quotation' as const,
          entityId: quotation.id,
          label: quotation.quotationNumber,
          description: 'Quotation created',
          occurredAt: quotation.createdAt.toISOString(),
        })),
      );
    }

    return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 8);
  }
}

function conversionRate(converted: number, total: number): string {
  if (total === 0) {
    return '0';
  }
  return new Prisma.Decimal(converted).dividedBy(total).times(100).toDecimalPlaces(2).toString();
}

type FollowUpEntityRefs = {
  lead: { firstName: string; lastName: string | null } | null;
  contact: { firstName: string; lastName: string | null } | null;
  company: { name: string } | null;
};

/** A follow-up relates to exactly one of lead/contact/company (enforced in FollowUpsService.create). */
function entityLabel(followUp: FollowUpEntityRefs): string {
  const person = followUp.lead ?? followUp.contact;
  if (person) {
    return [person.firstName, person.lastName].filter(Boolean).join(' ');
  }
  return followUp.company?.name ?? 'Unlinked';
}
