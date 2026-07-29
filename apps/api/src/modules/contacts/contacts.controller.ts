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
import type { ApiCollectionResponse, AuthenticatedUser, Contact } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsQuery } from './dto/list-contacts.query';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @RequirePermission('contact.read')
  @Get()
  list(@Query() query: ListContactsQuery): Promise<ApiCollectionResponse<Contact>> {
    return this.contactsService.list(query);
  }

  @RequirePermission('contact.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Contact> {
    return this.contactsService.getById(id);
  }

  @RequirePermission('contact.create')
  @Post()
  create(
    @Body() dto: CreateContactDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Contact> {
    return this.contactsService.create(dto, actor.id);
  }

  @RequirePermission('contact.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Contact> {
    return this.contactsService.update(id, dto, actor.id);
  }

  @RequirePermission('contact.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.contactsService.archive(id, actor.id);
  }
}
