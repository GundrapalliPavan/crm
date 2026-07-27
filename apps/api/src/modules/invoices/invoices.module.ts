import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { InvoicesController } from './invoices.controller';
import { OutstandingInvoicesController } from './outstanding-invoices.controller';
import { SalesOrderInvoiceController } from './sales-order-invoice.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [CustomersModule],
  controllers: [InvoicesController, SalesOrderInvoiceController, OutstandingInvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
