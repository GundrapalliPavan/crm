import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, FollowUp } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CompleteFollowUpDto } from './dto/complete-follow-up.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { ListFollowUpsQuery } from './dto/list-follow-ups.query';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpsService } from './follow-ups.service';

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @RequirePermission('follow_up.read')
  @Get()
  list(@Query() query: ListFollowUpsQuery): Promise<ApiCollectionResponse<FollowUp>> {
    return this.followUpsService.list(query);
  }

  @RequirePermission('follow_up.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<FollowUp> {
    return this.followUpsService.getById(id);
  }

  @RequirePermission('follow_up.create')
  @Post()
  create(
    @Body() dto: CreateFollowUpDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FollowUp> {
    return this.followUpsService.create(dto, actor.id);
  }

  @RequirePermission('follow_up.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FollowUp> {
    return this.followUpsService.update(id, dto, actor.id);
  }

  @RequirePermission('follow_up.complete')
  @HttpCode(HttpStatus.OK)
  @Post(':id/complete')
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteFollowUpDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FollowUp> {
    return this.followUpsService.complete(id, dto, actor.id);
  }

  @RequirePermission('follow_up.update')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<FollowUp> {
    return this.followUpsService.cancel(id, actor.id);
  }
}

/** API.md section 45 - kept separate from FollowUpsController since it lives at /me, not /follow-ups. */
@Controller('me')
export class MyFollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @RequirePermission('follow_up.read')
  @Get('follow-ups')
  listMine(
    @Query() query: ListFollowUpsQuery,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ApiCollectionResponse<FollowUp>> {
    return this.followUpsService.listMine(actor.id, query);
  }
}
