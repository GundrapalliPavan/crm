import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { ProductCategory } from '@crm/types';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategoriesService } from './product-categories.service';

/**
 * Product Catalog (Module 2 - ARCHITECTURE.md section 19, API.md section 52).
 * No DELETE: deletion depends on whether products reference the category
 * (API.md section 52) - deactivate via PATCH { isActive: false } instead.
 */
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @RequirePermission('product.read')
  @Get()
  list(): Promise<{ data: ProductCategory[] }> {
    return this.categoriesService.list();
  }

  @RequirePermission('product.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<ProductCategory> {
    return this.categoriesService.getById(id);
  }

  @RequirePermission('product.create')
  @Post()
  create(@Body() dto: CreateProductCategoryDto): Promise<ProductCategory> {
    return this.categoriesService.create(dto);
  }

  @RequirePermission('product.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.categoriesService.update(id, dto);
  }
}
