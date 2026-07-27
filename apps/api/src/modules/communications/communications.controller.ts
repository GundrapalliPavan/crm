import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Communication } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { ListCommunicationsQuery } from './dto/list-communications.query';
import { CommunicationsService } from './communications.service';

/** API.md sections 84-88 - the centralized log behind the Unified Communication Timeline. */
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @RequirePermission('communication.read')
  @Get()
  list(@Query() query: ListCommunicationsQuery): Promise<ApiCollectionResponse<Communication>> {
    return this.communicationsService.list(query);
  }

  @RequirePermission('communication.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Communication> {
    return this.communicationsService.getById(id);
  }

  @RequirePermission('communication.send')
  @Post()
  create(
    @Body() dto: CreateCommunicationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Communication> {
    return this.communicationsService.create(dto, actor.id);
  }
}
