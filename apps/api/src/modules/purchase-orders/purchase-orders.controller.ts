import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, PurchaseOrder, PurchaseOrderSummary } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ListPurchaseOrdersQuery } from './dto/list-purchase-orders.query';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';

/** API.md section 70-71. */
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @RequirePermission('purchase_order.read')
  @Get()
  list(@Query() query: ListPurchaseOrdersQuery): Promise<ApiCollectionResponse<PurchaseOrderSummary>> {
    return this.purchaseOrdersService.list(query);
  }

  @RequirePermission('purchase_order.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.getById(id);
  }

  @RequirePermission('purchase_order.create')
  @Post()
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(dto, actor.id);
  }

  @RequirePermission('purchase_order.update')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, dto);
  }

  @RequirePermission('purchase_order.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.submit(id);
  }

  @RequirePermission('purchase_order.approve')
  @HttpCode(HttpStatus.OK)
  @Post(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.approve(id, actor.id);
  }

  @RequirePermission('purchase_order.approve')
  @HttpCode(HttpStatus.OK)
  @Post(':id/reject-approval')
  rejectApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.rejectApproval(id, actor.id);
  }

  @RequirePermission('purchase_order.send')
  @HttpCode(HttpStatus.OK)
  @Post(':id/send')
  send(@Param('id', ParseUUIDPipe) id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.send(id);
  }

  @RequirePermission('purchase_order.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/supplier-confirm')
  markSupplierConfirmed(@Param('id', ParseUUIDPipe) id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.markSupplierConfirmed(id);
  }

  @RequirePermission('purchase_order.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/close')
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.close(id, actor.id);
  }

  @RequirePermission('purchase_order.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelPurchaseOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.cancel(id, dto, actor.id);
  }
}
