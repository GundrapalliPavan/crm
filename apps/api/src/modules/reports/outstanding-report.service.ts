import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { OutstandingReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { addToAgeingBuckets, emptyAgeingBuckets, type AgeingBuckets } from '../../common/reports/ageing';
import { toCsv } from '../../common/reports/csv';
import { OutstandingReportQuery } from './dto/outstanding-report.query';

const OUTSTANDING_INVOICE_STATUSES = ['issued', 'partially_paid'] as const;

@Injectable()
export class OutstandingReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: OutstandingReportQuery): Promise<OutstandingReportResponse> {
    const asOf = new Date();
    const where: Prisma.InvoiceWhereInput = { status: { in: [...OUTSTANDING_INVOICE_STATUSES] } };
    if (query.customerId) where.customerCompanyId = query.customerId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { customer: { select: { id: true, name: true } } },
    });

    const byCustomer = new Map<
      string,
      { companyName: string; invoiceCount: number; totalOutstanding: Prisma.Decimal; buckets: AgeingBuckets }
    >();

    for (const invoice of invoices) {
      const entry = byCustomer.get(invoice.customerCompanyId) ?? {
        companyName: invoice.customer.name,
        invoiceCount: 0,
        totalOutstanding: new Prisma.Decimal(0),
        buckets: emptyAgeingBuckets(),
      };
      entry.invoiceCount += 1;
      entry.totalOutstanding = entry.totalOutstanding.plus(invoice.outstandingAmount);
      addToAgeingBuckets(entry.buckets, invoice.dueDate ?? invoice.invoiceDate, invoice.outstandingAmount, asOf);
      byCustomer.set(invoice.customerCompanyId, entry);
    }

    const rows = [...byCustomer.entries()]
      .map(([companyId, entry]) => ({
        companyId,
        companyName: entry.companyName,
        invoiceCount: entry.invoiceCount,
        totalOutstanding: entry.totalOutstanding.toString(),
        current: entry.buckets.current.toString(),
        days30: entry.buckets.days30.toString(),
        days60: entry.buckets.days60.toString(),
        days90: entry.buckets.days90.toString(),
        daysOver90: entry.buckets.daysOver90.toString(),
      }))
      .sort((a, b) => Number(b.totalOutstanding) - Number(a.totalOutstanding));

    return {
      asOf: asOf.toISOString().slice(0, 10),
      totalOutstanding: rows.reduce((sum, row) => sum.plus(row.totalOutstanding), new Prisma.Decimal(0)).toString(),
      byCustomer: rows,
    };
  }

  async getReportCsv(query: OutstandingReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Customer', 'Invoice Count', 'Total Outstanding', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
      report.byCustomer.map((row) => [
        row.companyName,
        row.invoiceCount,
        row.totalOutstanding,
        row.current,
        row.days30,
        row.days60,
        row.days90,
        row.daysOver90,
      ]),
    );
  }
}
