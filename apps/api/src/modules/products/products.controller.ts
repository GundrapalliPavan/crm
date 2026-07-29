import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Product } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQuery } from './dto/list-products.query';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

/** Product Catalog (Module 2 - ARCHITECTURE.md section 19, API.md sections 49-51). */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequirePermission('product.read')
  @Get()
  list(@Query() query: ListProductsQuery): Promise<ApiCollectionResponse<Product>> {
    return this.productsService.list(query);
  }

  @RequirePermission('product.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.getById(id);
  }

  @RequirePermission('product.create')
  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.create(dto, actor.id);
  }

  @RequirePermission('product.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.update(id, dto, actor.id);
  }

  @RequirePermission('product.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.productsService.archive(id, actor.id);
  }
}
