import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthenticatedUser, CreateInvoiceResponse } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateInvoiceFromSalesOrderDto } from './dto/create-invoice-from-sales-order.dto';
import { InvoicesService } from './invoices.service';

/**
 * API.md section 77 - a separate controller under the `sales-orders` prefix
 * (same pattern as Quotations' `convert-to-order`, sales-orders/sales-order-
 * .mapper.ts's plain functions being imported directly rather than injecting
 * a whole SalesOrdersService and risking a circular module dependency).
 */
@Controller('sales-orders')
export class SalesOrderInvoiceController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @RequirePermission('invoice.create')
  @Post(':id/create-invoice')
  createInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceFromSalesOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CreateInvoiceResponse> {
    return this.invoicesService.createFromSalesOrder(id, dto, actor.id);
  }
}
