import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { Warehouse } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';

/** API.md section 55: no DELETE - warehouses are referenced by balances/movements/goods receipts. */
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @RequirePermission('warehouse.read')
  @Get()
  list(): Promise<{ data: Warehouse[] }> {
    return this.warehousesService.list();
  }

  @RequirePermission('warehouse.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return this.warehousesService.getById(id);
  }

  @RequirePermission('warehouse.manage')
  @Post()
  create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehousesService.create(dto);
  }

  @RequirePermission('warehouse.manage')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWarehouseDto): Promise<Warehouse> {
    return this.warehousesService.update(id, dto);
  }
}
