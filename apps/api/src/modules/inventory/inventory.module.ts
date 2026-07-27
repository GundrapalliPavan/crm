import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProductInventoryController } from './product-inventory.controller';
import { StockMovementsController } from './stock-movements.controller';

@Module({
  controllers: [InventoryController, ProductInventoryController, StockMovementsController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
