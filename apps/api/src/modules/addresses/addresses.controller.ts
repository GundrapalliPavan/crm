import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { Address } from '@crm/types';
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
  create(@Body() dto: CreateAddressDto): Promise<Address> {
    return this.addressesService.create(dto);
  }

  @RequirePermission('address.manage')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAddressDto): Promise<Address> {
    return this.addressesService.update(id, dto);
  }

  @RequirePermission('address.manage')
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.addressesService.delete(id);
  }
}
