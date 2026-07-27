import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, InventoryBalance } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';
import { ListInventoryQuery } from './dto/list-inventory.query';
import { InventoryService } from './inventory.service';

/** API.md sections 56, 59-60. */
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermission('inventory.read')
  @Get()
  list(@Query() query: ListInventoryQuery): Promise<ApiCollectionResponse<InventoryBalance>> {
    return this.inventoryService.list(query);
  }

  @RequirePermission('inventory.adjust')
  @Post('adjustments')
  createAdjustment(
    @Body() dto: CreateInventoryAdjustmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<InventoryBalance> {
    return this.inventoryService.createAdjustment(dto, actor.id);
  }

  @RequirePermission('inventory.transfer')
  @Post('transfers')
  createTransfer(
    @Body() dto: CreateInventoryTransferDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<{ from: InventoryBalance; to: InventoryBalance }> {
    return this.inventoryService.createTransfer(dto, actor.id);
  }
}
