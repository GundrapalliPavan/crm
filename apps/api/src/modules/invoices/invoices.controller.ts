import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, CreateInvoiceResponse, Invoice, InvoiceSummary } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ListInvoicesQuery } from './dto/list-invoices.query';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

/** API.md section 76. */
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @RequirePermission('invoice.read')
  @Get()
  list(@Query() query: ListInvoicesQuery): Promise<ApiCollectionResponse<InvoiceSummary>> {
    return this.invoicesService.list(query);
  }

  @RequirePermission('invoice.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.getById(id);
  }

  @RequirePermission('invoice.create')
  @Post()
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CreateInvoiceResponse> {
    return this.invoicesService.create(dto, actor.id);
  }

  @RequirePermission('invoice.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, dto, actor.id);
  }

  @RequirePermission('invoice.issue')
  @HttpCode(HttpStatus.OK)
  @Post(':id/issue')
  issue(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.issue(id, actor.id);
  }

  @RequirePermission('invoice.cancel')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelInvoiceDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.cancel(id, dto, actor.id);
  }
}
