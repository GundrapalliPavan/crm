import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, CreateUserResponse } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.query';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';

/**
 * Identity administration (Step 4 sections 37-39, 74). Not a Team Management
 * module - no targets, territories, attendance or performance data here.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermission('user.read')
  @Get()
  list(@Query() query: ListUsersQuery): Promise<ApiCollectionResponse<AuthenticatedUser>> {
    return this.usersService.list(query);
  }

  @RequirePermission('user.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<AuthenticatedUser> {
    return this.usersService.getById(id);
  }

  @RequirePermission('user.create')
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CreateUserResponse> {
    return this.usersService.create(dto, actor.id);
  }

  @RequirePermission('user.update')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AuthenticatedUser> {
    return this.usersService.updateStatus(id, dto.status, actor.id);
  }

  @RequirePermission('role.manage')
  @Patch(':id/roles')
  assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserRolesDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AuthenticatedUser> {
    return this.usersService.assignRoles(id, dto, actor.id);
  }
}
