import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SalesReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/reports/date-range';
import { toCsv } from '../../common/reports/csv';
import { SalesReportQuery } from './dto/sales-report.query';

const TOP_ROWS_LIMIT = 10;

@Injectable()
export class SalesReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: SalesReportQuery): Promise<SalesReportResponse> {
    const range = resolveDateRange(query.dateFrom, query.dateTo);

    const quotationWhere: Prisma.QuotationWhereInput = { quotationDate: { gte: range.from, lt: range.to } };
    if (query.userId) quotationWhere.ownerId = query.userId;
    if (query.customerId) quotationWhere.customerCompanyId = query.customerId;

    const salesOrderWhere: Prisma.SalesOrderWhereInput = {
      orderDate: { gte: range.from, lt: range.to },
      status: { not: 'cancelled' },
    };
    if (query.userId) salesOrderWhere.ownerId = query.userId;
    if (query.customerId) salesOrderWhere.customerCompanyId = query.customerId;

    const [quotationAggregate, salesOrderAggregate, topProductRows, topCustomerRows] = await Promise.all([
      this.prisma.quotation.aggregate({ where: quotationWhere, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.salesOrder.aggregate({ where: salesOrderWhere, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.salesOrderItem.groupBy({
        by: ['productId'],
        where: { salesOrder: salesOrderWhere },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: TOP_ROWS_LIMIT,
      }),
      this.prisma.salesOrder.groupBy({
        by: ['customerCompanyId'],
        where: salesOrderWhere,
        _count: { _all: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: TOP_ROWS_LIMIT,
      }),
    ]);

    const productIds = topProductRows.map((row) => row.productId);
    const companyIds = topCustomerRows.map((row) => row.customerCompanyId);
    const [products, companies] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: productIds } } }),
      this.prisma.company.findMany({ where: { id: { in: companyIds } } }),
    ]);
    const productById = new Map(products.map((product) => [product.id, product]));
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      overview: {
        quotationCount: quotationAggregate._count._all,
        quotationValue: new Prisma.Decimal(quotationAggregate._sum.totalAmount ?? 0).toString(),
        salesOrderCount: salesOrderAggregate._count._all,
        salesOrderValue: new Prisma.Decimal(salesOrderAggregate._sum.totalAmount ?? 0).toString(),
      },
      topProducts: topProductRows.map((row) => {
        const product = productById.get(row.productId);
        return {
          productId: row.productId,
          sku: product?.sku ?? 'Unknown',
          productName: product?.name ?? 'Unknown product',
          quantity: new Prisma.Decimal(row._sum.quantity ?? 0).toString(),
          revenue: new Prisma.Decimal(row._sum.lineTotal ?? 0).toString(),
        };
      }),
      topCustomers: topCustomerRows.map((row) => {
        const company = companyById.get(row.customerCompanyId);
        return {
          companyId: row.customerCompanyId,
          companyName: company?.name ?? 'Unknown company',
          orderCount: row._count._all,
          revenue: new Prisma.Decimal(row._sum.totalAmount ?? 0).toString(),
        };
      }),
    };
  }

  async getReportCsv(query: SalesReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Product', 'SKU', 'Quantity', 'Revenue'],
      report.topProducts.map((row) => [row.productName, row.sku, row.quantity, row.revenue]),
    );
  }
}
