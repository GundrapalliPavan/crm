import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Team, TeamMember } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { ListTeamsQuery } from './dto/list-teams.query';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

/** API.md section 102. `team.manage` gates every route, matching the `role.manage` precedent of one permission for both reads and writes. */
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @RequirePermission('team.manage')
  @Get()
  list(@Query() query: ListTeamsQuery): Promise<ApiCollectionResponse<Team>> {
    return this.teamsService.list(query);
  }

  @RequirePermission('team.manage')
  @Get(':teamId')
  getById(@Param('teamId', ParseUUIDPipe) teamId: string): Promise<Team> {
    return this.teamsService.getById(teamId);
  }

  @RequirePermission('team.manage')
  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser() actor: AuthenticatedUser): Promise<Team> {
    return this.teamsService.create(dto, actor.id);
  }

  @RequirePermission('team.manage')
  @Patch(':teamId')
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Team> {
    return this.teamsService.update(teamId, dto, actor.id);
  }

  @RequirePermission('team.manage')
  @Get(':teamId/members')
  listMembers(@Param('teamId', ParseUUIDPipe) teamId: string): Promise<{ data: TeamMember[] }> {
    return this.teamsService.listMembers(teamId);
  }

  @RequirePermission('team.manage')
  @Post(':teamId/members')
  addMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: AddTeamMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TeamMember> {
    return this.teamsService.addMember(teamId, dto, actor.id);
  }

  @RequirePermission('team.manage')
  @Delete(':teamId/members/:userId')
  removeMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<void> {
    return this.teamsService.removeMember(teamId, userId, actor.id);
  }
}
