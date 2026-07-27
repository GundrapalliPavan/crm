import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { INVOICE_STATUSES } from '@crm/types';
import type { BillingReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/reports/date-range';
import { toCsv } from '../../common/reports/csv';
import { BillingReportQuery } from './dto/billing-report.query';

@Injectable()
export class BillingReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: BillingReportQuery): Promise<BillingReportResponse> {
    const range = resolveDateRange(query.dateFrom, query.dateTo);

    const invoiceWhere: Prisma.InvoiceWhereInput = { invoiceDate: { gte: range.from, lt: range.to } };
    if (query.customerId) invoiceWhere.customerCompanyId = query.customerId;

    const paymentWhere: Prisma.PaymentWhereInput = {
      paymentDate: { gte: range.from, lt: range.to },
      status: { not: 'cancelled' },
    };
    if (query.customerId) paymentWhere.customerCompanyId = query.customerId;

    const [invoiceAggregate, statusGroups, paymentAggregate] = await Promise.all([
      this.prisma.invoice.aggregate({ where: invoiceWhere, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.invoice.groupBy({ by: ['status'], where: invoiceWhere, _count: { _all: true }, _sum: { totalAmount: true } }),
      this.prisma.payment.aggregate({ where: paymentWhere, _count: { _all: true }, _sum: { amount: true } }),
    ]);
    const statusRowMap = new Map(statusGroups.map((row) => [row.status, row]));

    return {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      invoiceRegister: {
        totalInvoices: invoiceAggregate._count._all,
        totalValue: new Prisma.Decimal(invoiceAggregate._sum.totalAmount ?? 0).toString(),
        byStatus: INVOICE_STATUSES.map((status) => {
          const row = statusRowMap.get(status);
          return {
            status,
            count: row?._count._all ?? 0,
            value: new Prisma.Decimal(row?._sum.totalAmount ?? 0).toString(),
          };
        }),
      },
      collections: {
        totalPayments: paymentAggregate._count._all,
        totalCollected: new Prisma.Decimal(paymentAggregate._sum.amount ?? 0).toString(),
      },
    };
  }

  async getReportCsv(query: BillingReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Status', 'Invoice Count', 'Value'],
      report.invoiceRegister.byStatus.map((row) => [row.status, row.count, row.value]),
    );
  }
}
