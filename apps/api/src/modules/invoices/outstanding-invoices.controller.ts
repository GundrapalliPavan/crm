import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { OutstandingInvoice } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { InvoicesService } from './invoices.service';

/** API.md section 83 - feeds the payment-entry allocation picker. */
@Controller('companies')
export class OutstandingInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @RequirePermission('invoice.read')
  @Get(':id/outstanding-invoices')
  getOutstandingInvoices(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: OutstandingInvoice[] }> {
    return this.invoicesService.getOutstandingInvoicesForCompany(id);
  }
}
