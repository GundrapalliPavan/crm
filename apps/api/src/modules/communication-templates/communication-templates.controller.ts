import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, CommunicationTemplate } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateCommunicationTemplateDto } from './dto/create-communication-template.dto';
import { ListCommunicationTemplatesQuery } from './dto/list-communication-templates.query';
import { UpdateCommunicationTemplateDto } from './dto/update-communication-template.dto';
import { CommunicationTemplatesService } from './communication-templates.service';

/** API.md section 89. Viewing reuses `communication.read` - no dedicated `communication_template.read` is seeded. */
@Controller('communication-templates')
export class CommunicationTemplatesController {
  constructor(private readonly communicationTemplatesService: CommunicationTemplatesService) {}

  @RequirePermission('communication.read')
  @Get()
  list(@Query() query: ListCommunicationTemplatesQuery): Promise<ApiCollectionResponse<CommunicationTemplate>> {
    return this.communicationTemplatesService.list(query);
  }

  @RequirePermission('communication.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<CommunicationTemplate> {
    return this.communicationTemplatesService.getById(id);
  }

  @RequirePermission('communication_template.manage')
  @Post()
  create(
    @Body() dto: CreateCommunicationTemplateDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CommunicationTemplate> {
    return this.communicationTemplatesService.create(dto, actor.id);
  }

  @RequirePermission('communication_template.manage')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommunicationTemplateDto,
  ): Promise<CommunicationTemplate> {
    return this.communicationTemplatesService.update(id, dto);
  }
}
