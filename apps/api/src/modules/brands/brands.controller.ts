import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { AuthenticatedUser, Brand } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
  create(@Body() dto: CreateBrandDto, @CurrentUser() actor: AuthenticatedUser): Promise<Brand> {
    return this.brandsService.create(dto, actor.id);
  }

  @RequirePermission('product.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Brand> {
    return this.brandsService.update(id, dto, actor.id);
  }
}
