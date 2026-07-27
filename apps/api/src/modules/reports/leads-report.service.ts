import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LEAD_STATUSES } from '@crm/types';
import type { LeadsReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/reports/date-range';
import { toCsv } from '../../common/reports/csv';
import { LeadsReportQuery } from './dto/leads-report.query';

@Injectable()
export class LeadsReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: LeadsReportQuery): Promise<LeadsReportResponse> {
    const range = resolveDateRange(query.dateFrom, query.dateTo);
    const where: Prisma.LeadWhereInput = { createdAt: { gte: range.from, lt: range.to } };
    if (query.userId) where.assignedTo = query.userId;

    const [totalLeads, convertedLeads, statusGroups, sourceGroups, sources] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, status: 'converted' } }),
      this.prisma.lead.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.lead.groupBy({ by: ['sourceId'], where, _count: { _all: true } }),
      this.prisma.leadSource.findMany(),
    ]);

    const convertedBySource = await this.prisma.lead.groupBy({
      by: ['sourceId'],
      where: { ...where, status: 'converted' },
      _count: { _all: true },
    });
    const convertedBySourceMap = new Map(convertedBySource.map((row) => [row.sourceId, row._count._all]));
    const sourceNameById = new Map(sources.map((source) => [source.id, source.name]));
    const statusCountMap = new Map(statusGroups.map((row) => [row.status, row._count._all]));

    return {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      totalLeads,
      convertedLeads,
      conversionRate: conversionRate(convertedLeads, totalLeads),
      funnel: LEAD_STATUSES.map((status) => ({ status, count: statusCountMap.get(status) ?? 0 })),
      bySource: sourceGroups.map((row) => {
        const total = row._count._all;
        const converted = convertedBySourceMap.get(row.sourceId) ?? 0;
        return {
          sourceId: row.sourceId,
          sourceName: row.sourceId ? (sourceNameById.get(row.sourceId) ?? 'Unknown') : 'Not Set',
          totalLeads: total,
          convertedLeads: converted,
          conversionRate: conversionRate(converted, total),
        };
      }),
    };
  }

  async getReportCsv(query: LeadsReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Source', 'Total Leads', 'Converted Leads', 'Conversion Rate %'],
      report.bySource.map((row) => [row.sourceName, row.totalLeads, row.convertedLeads, row.conversionRate]),
    );
  }
}

function conversionRate(converted: number, total: number): string {
  if (total === 0) {
    return '0';
  }
  return new Prisma.Decimal(converted).dividedBy(total).times(100).toDecimalPlaces(2).toString();
}
