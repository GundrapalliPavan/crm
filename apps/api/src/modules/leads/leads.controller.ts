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
import type { ApiCollectionResponse, AuthenticatedUser, Lead, LeadActivity } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AssignLeadDto } from './dto/assign-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadStatusTransitionDto } from './dto/lead-status-transition.dto';
import { ListLeadsQuery } from './dto/list-leads.query';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

/**
 * CRM & Lead Management (Module 1 - CRM.md, API.md sections 38-43).
 * Communication (WhatsApp/Email/SMS sending), visits and scoring are out of
 * scope here - see CRM.md section 92.
 */
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @RequirePermission('lead.read')
  @Get()
  list(@Query() query: ListLeadsQuery): Promise<ApiCollectionResponse<Lead>> {
    return this.leadsService.list(query);
  }

  @RequirePermission('lead.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Lead> {
    return this.leadsService.getById(id);
  }

  @RequirePermission('lead.create')
  @Post()
  create(
    @Body() dto: CreateLeadDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Lead> {
    return this.leadsService.create(dto, actor.id);
  }

  @RequirePermission('lead.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Lead> {
    return this.leadsService.update(id, dto, actor.id);
  }

  @RequirePermission('lead.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<void> {
    return this.leadsService.archive(id, actor.id);
  }

  @RequirePermission('lead.assign')
  @HttpCode(HttpStatus.OK)
  @Post(':id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignLeadDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Lead> {
    return this.leadsService.assign(id, dto, actor.id);
  }

  @RequirePermission('lead.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/status')
  transitionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LeadStatusTransitionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Lead> {
    return this.leadsService.transitionStatus(id, dto, actor.id);
  }

  @RequirePermission('lead.convert')
  @HttpCode(HttpStatus.OK)
  @Post(':id/convert')
  convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertLeadDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Lead> {
    return this.leadsService.convert(id, dto, actor.id);
  }

  @RequirePermission('lead.read')
  @Get(':id/activities')
  listActivities(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: LeadActivity[] }> {
    return this.leadsService.listActivities(id);
  }

  @RequirePermission('lead.update')
  @Post(':id/activities')
  createActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLeadActivityDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<LeadActivity> {
    return this.leadsService.createActivity(id, dto, actor.id);
  }
}
