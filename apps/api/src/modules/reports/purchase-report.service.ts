import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PURCHASE_ORDER_STATUSES } from '@crm/types';
import type { PurchaseReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/reports/date-range';
import { toCsv } from '../../common/reports/csv';
import { PurchaseReportQuery } from './dto/purchase-report.query';

const TOP_ROWS_LIMIT = 10;

@Injectable()
export class PurchaseReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: PurchaseReportQuery): Promise<PurchaseReportResponse> {
    const range = resolveDateRange(query.dateFrom, query.dateTo);
    const where: Prisma.PurchaseOrderWhereInput = { poDate: { gte: range.from, lt: range.to } };
    if (query.supplierCompanyId) where.supplierCompanyId = query.supplierCompanyId;

    const [totalAggregate, statusGroups, supplierGroups] = await Promise.all([
      this.prisma.purchaseOrder.aggregate({ where, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.purchaseOrder.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.purchaseOrder.groupBy({
        by: ['supplierCompanyId'],
        where,
        _count: { _all: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: TOP_ROWS_LIMIT,
      }),
    ]);

    const suppliers = await this.prisma.company.findMany({
      where: { id: { in: supplierGroups.map((row) => row.supplierCompanyId) } },
    });
    const supplierNameById = new Map(suppliers.map((supplier) => [supplier.id, supplier.name]));
    const statusCountMap = new Map(statusGroups.map((row) => [row.status, row]));

    return {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      overview: {
        totalOrders: totalAggregate._count._all,
        totalValue: new Prisma.Decimal(totalAggregate._sum.totalAmount ?? 0).toString(),
        byStatus: PURCHASE_ORDER_STATUSES.map((status) => {
          const row = statusCountMap.get(status);
          return {
            status,
            count: row?._count._all ?? 0,
            value: new Prisma.Decimal(row?._sum.totalAmount ?? 0).toString(),
          };
        }),
      },
      bySupplier: supplierGroups.map((row) => ({
        supplierCompanyId: row.supplierCompanyId,
        supplierName: supplierNameById.get(row.supplierCompanyId) ?? 'Unknown supplier',
        orderCount: row._count._all,
        totalValue: new Prisma.Decimal(row._sum.totalAmount ?? 0).toString(),
      })),
    };
  }

  async getReportCsv(query: PurchaseReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Supplier', 'Order Count', 'Total Value'],
      report.bySupplier.map((row) => [row.supplierName, row.orderCount, row.totalValue]),
    );
  }
}
