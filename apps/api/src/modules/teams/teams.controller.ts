import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, Team, TeamMember } from '@crm/types';
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
  create(@Body() dto: CreateTeamDto): Promise<Team> {
    return this.teamsService.create(dto);
  }

  @RequirePermission('team.manage')
  @Patch(':teamId')
  update(@Param('teamId', ParseUUIDPipe) teamId: string, @Body() dto: UpdateTeamDto): Promise<Team> {
    return this.teamsService.update(teamId, dto);
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
  ): Promise<TeamMember> {
    return this.teamsService.addMember(teamId, dto);
  }

  @RequirePermission('team.manage')
  @Delete(':teamId/members/:userId')
  removeMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return this.teamsService.removeMember(teamId, userId);
  }
}
