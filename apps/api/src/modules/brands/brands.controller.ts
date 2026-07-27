import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { Brand } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

/** API.md section 53: no DELETE - deactivate via PATCH { isActive: false }. */
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @RequirePermission('product.read')
  @Get()
  list(): Promise<{ data: Brand[] }> {
    return this.brandsService.list();
  }

  @RequirePermission('product.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Brand> {
    return this.brandsService.getById(id);
  }

  @RequirePermission('product.create')
  @Post()
  create(@Body() dto: CreateBrandDto): Promise<Brand> {
    return this.brandsService.create(dto);
  }

  @RequirePermission('product.update')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto): Promise<Brand> {
    return this.brandsService.update(id, dto);
  }
}
