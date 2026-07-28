import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TeamPerformanceReportResponse, TeamPerformanceRow } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/reports/date-range';
import { toCsv } from '../../common/reports/csv';
import { TeamPerformanceReportQuery } from './dto/team-performance-report.query';

@Injectable()
export class TeamPerformanceReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: TeamPerformanceReportQuery): Promise<TeamPerformanceReportResponse> {
    const range = resolveDateRange(query.dateFrom, query.dateTo);
    const teams = await this.prisma.team.findMany({
      where: query.teamId ? { id: query.teamId } : { isActive: true },
      orderBy: { name: 'asc' },
    });

    const rows = await Promise.all(teams.map((team) => this.buildRow(team.id, team.name, range)));

    return { dateFrom: range.dateFrom, dateTo: range.dateTo, teams: rows };
  }

  async getReportCsv(query: TeamPerformanceReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Team', 'Members', 'Leads', 'Converted Leads', 'Quotations', 'Quotation Value', 'Sales Orders', 'Sales Order Value'],
      report.teams.map((row) => [
        row.teamName,
        row.memberCount,
        row.leadCount,
        row.convertedLeadCount,
        row.quotationCount,
        row.quotationValue,
        row.salesOrderCount,
        row.salesOrderValue,
      ]),
    );
  }

  private async buildRow(
    teamId: string,
    teamName: string,
    range: { from: Date; to: Date },
  ): Promise<TeamPerformanceRow> {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId, isActive: true },
      select: { userId: true },
    });
    const memberUserIds = members.map((member) => member.userId);

    const leadWhere: Prisma.LeadWhereInput = {
      assignedTeamId: teamId,
      createdAt: { gte: range.from, lt: range.to },
    };
    const quotationWhere: Prisma.QuotationWhereInput = {
      ownerId: { in: memberUserIds },
      quotationDate: { gte: range.from, lt: range.to },
    };
    const salesOrderWhere: Prisma.SalesOrderWhereInput = {
      ownerId: { in: memberUserIds },
      orderDate: { gte: range.from, lt: range.to },
      status: { not: 'cancelled' },
    };

    const [leadCount, convertedLeadCount, quotationAggregate, salesOrderAggregate] = await Promise.all([
      this.prisma.lead.count({ where: leadWhere }),
      this.prisma.lead.count({ where: { ...leadWhere, status: 'converted' } }),
      this.prisma.quotation.aggregate({
        where: quotationWhere,
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.salesOrder.aggregate({
        where: salesOrderWhere,
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      teamId,
      teamName,
      memberCount: memberUserIds.length,
      leadCount,
      convertedLeadCount,
      conversionRate: conversionRate(convertedLeadCount, leadCount),
      quotationCount: quotationAggregate._count._all,
      quotationValue: new Prisma.Decimal(quotationAggregate._sum.totalAmount ?? 0).toString(),
      salesOrderCount: salesOrderAggregate._count._all,
      salesOrderValue: new Prisma.Decimal(salesOrderAggregate._sum.totalAmount ?? 0).toString(),
    };
  }
}

function conversionRate(converted: number, total: number): string {
  if (total === 0) {
    return '0';
  }
  return new Prisma.Decimal(converted).dividedBy(total).times(100).toDecimalPlaces(2).toString();
}
