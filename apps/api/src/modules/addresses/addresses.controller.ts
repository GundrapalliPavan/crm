import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { Address, AuthenticatedUser } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListAddressesQuery } from './dto/list-addresses.query';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @RequirePermission('address.read')
  @Get()
  list(@Query() query: ListAddressesQuery): Promise<{ data: Address[] }> {
    return this.addressesService.list(query);
  }

  @RequirePermission('address.manage')
  @Post()
  create(@Body() dto: CreateAddressDto, @CurrentUser() actor: AuthenticatedUser): Promise<Address> {
    return this.addressesService.create(dto, actor.id);
  }

  @RequirePermission('address.manage')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Address> {
    return this.addressesService.update(id, dto, actor.id);
  }

  @RequirePermission('address.manage')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.addressesService.delete(id, actor.id);
  }
}
