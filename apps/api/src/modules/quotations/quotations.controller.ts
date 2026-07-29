import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Quotation, QuotationSummary, SalesOrder } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CancelQuotationDto } from './dto/cancel-quotation.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { ListQuotationsQuery } from './dto/list-quotations.query';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationsService } from './quotations.service';

/** API.md sections 62-65. */
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @RequirePermission('quotation.read')
  @Get()
  list(@Query() query: ListQuotationsQuery): Promise<ApiCollectionResponse<QuotationSummary>> {
    return this.quotationsService.list(query);
  }

  @RequirePermission('quotation.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Quotation> {
    return this.quotationsService.getById(id);
  }

  @RequirePermission('quotation.create')
  @Post()
  create(
    @Body() dto: CreateQuotationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Quotation> {
    return this.quotationsService.create(dto, actor.id);
  }

  @RequirePermission('quotation.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Quotation> {
    return this.quotationsService.update(id, dto, actor.id);
  }

  @RequirePermission('quotation.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string): Promise<Quotation> {
    return this.quotationsService.submit(id);
  }

  @RequirePermission('quotation.approve')
  @HttpCode(HttpStatus.OK)
  @Post(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Quotation> {
    return this.quotationsService.approve(id, actor.id);
  }

  @RequirePermission('quotation.approve')
  @HttpCode(HttpStatus.OK)
  @Post(':id/reject-approval')
  rejectApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Quotation> {
    return this.quotationsService.rejectApproval(id, actor.id);
  }

  @RequirePermission('quotation.send')
  @HttpCode(HttpStatus.OK)
  @Post(':id/send')
  send(@Param('id', ParseUUIDPipe) id: string): Promise<Quotation> {
    return this.quotationsService.send(id);
  }

  @RequirePermission('quotation.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/accept')
  accept(@Param('id', ParseUUIDPipe) id: string): Promise<Quotation> {
    return this.quotationsService.accept(id);
  }

  @RequirePermission('quotation.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string): Promise<Quotation> {
    return this.quotationsService.reject(id);
  }

  @RequirePermission('quotation.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelQuotationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Quotation> {
    return this.quotationsService.cancel(id, dto, actor.id);
  }

  @RequirePermission('sales_order.create')
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/convert-to-order')
  convertToOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SalesOrder> {
    return this.quotationsService.convertToOrder(id, actor.id);
  }
}
