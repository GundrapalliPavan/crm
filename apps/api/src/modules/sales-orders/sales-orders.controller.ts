import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type {
  ApiCollectionResponse,
  AuthenticatedUser,
  ConfirmSalesOrderResponse,
  SalesOrder,
  SalesOrderSummary,
} from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CancelSalesOrderDto } from './dto/cancel-sales-order.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ListSalesOrdersQuery } from './dto/list-sales-orders.query';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrdersService } from './sales-orders.service';

/** API.md sections 66, 68. */
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @RequirePermission('sales_order.read')
  @Get()
  list(@Query() query: ListSalesOrdersQuery): Promise<ApiCollectionResponse<SalesOrderSummary>> {
    return this.salesOrdersService.list(query);
  }

  @RequirePermission('sales_order.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<SalesOrder> {
    return this.salesOrdersService.getById(id);
  }

  @RequirePermission('sales_order.create')
  @Post()
  create(
    @Body() dto: CreateSalesOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.create(dto, actor.id);
  }

  @RequirePermission('sales_order.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalesOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.update(id, dto, actor.id);
  }

  @RequirePermission('sales_order.confirm')
  @HttpCode(HttpStatus.OK)
  @Post(':id/confirm')
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ConfirmSalesOrderResponse> {
    return this.salesOrdersService.confirm(id, actor.id);
  }

  @RequirePermission('sales_order.cancel')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelSalesOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.cancel(id, dto, actor.id);
  }

  @RequirePermission('sales_order.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/complete')
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SalesOrder> {
    return this.salesOrdersService.complete(id, actor.id);
  }
}
