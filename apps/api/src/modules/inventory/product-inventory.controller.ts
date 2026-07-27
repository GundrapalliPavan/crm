import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { InventoryBalance } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { InventoryService } from './inventory.service';

/**
 * API.md section 57: GET /products/{productId}/inventory - a product's stock
 * position across every warehouse. Kept as its own controller (still under
 * the `products` path) rather than folded into ProductsModule, since it is
 * inventory data owned by this module, not the product catalog.
 */
@Controller('products')
export class ProductInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermission('inventory.read')
  @Get(':productId/inventory')
  getProductInventory(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<{ data: InventoryBalance[] }> {
    return this.inventoryService.getProductInventory(productId);
  }
}
