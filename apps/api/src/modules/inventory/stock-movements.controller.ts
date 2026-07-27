import { Controller, Get, Query } from '@nestjs/common';
import type { ApiCollectionResponse, StockMovement } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ListStockMovementsQuery } from './dto/list-stock-movements.query';
import { InventoryService } from './inventory.service';

/** API.md section 58: read-only ledger - movements are created only as a side effect of adjustments/transfers. */
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermission('inventory.read')
  @Get()
  list(@Query() query: ListStockMovementsQuery): Promise<ApiCollectionResponse<StockMovement>> {
    return this.inventoryService.listMovements(query);
  }
}
