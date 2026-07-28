import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Team, TeamMember } from '@crm/types';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { ListTeamsQuery } from './dto/list-teams.query';
import { UpdateTeamDto } from './dto/update-team.dto';
import {
  TEAM_INCLUDE,
  TEAM_MEMBER_INCLUDE,
  toTeam,
  toTeamMember,
  type TeamWithRelations,
} from './team.mapper';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListTeamsQuery): Promise<ApiCollectionResponse<Team>> {
    const where: Prisma.TeamWhereInput = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [rows, totalItems] = await Promise.all([
      this.prisma.team.findMany({
        where,
        include: TEAM_INCLUDE,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.team.count({ where }),
    ]);
    const memberCountByTeam = await this.memberCountsFor(rows.map((row) => row.id));

    return {
      data: rows.map((team) => toTeam(team, memberCountByTeam.get(team.id) ?? 0)),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Team> {
    const team = await this.findTeamOrThrow(id);
    const memberCountByTeam = await this.memberCountsFor([team.id]);
    return toTeam(team, memberCountByTeam.get(team.id) ?? 0);
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    await this.assertNoDuplicateName(dto.name);
    if (dto.managerId) {
      await this.assertUserExists(dto.managerId);
    }

    const team = await this.prisma.team.create({
      data: { name: dto.name, description: dto.description, managerId: dto.managerId },
      include: TEAM_INCLUDE,
    });
    return toTeam(team, 0);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    await this.findTeamOrThrow(id);
    if (dto.name) {
      await this.assertNoDuplicateName(dto.name, id);
    }
    if (dto.managerId) {
      await this.assertUserExists(dto.managerId);
    }

    const team = await this.prisma.team.update({
      where: { id },
      data: dto,
      include: TEAM_INCLUDE,
    });
    const memberCountByTeam = await this.memberCountsFor([id]);
    return toTeam(team, memberCountByTeam.get(id) ?? 0);
  }

  async listMembers(teamId: string): Promise<{ data: TeamMember[] }> {
    await this.findTeamOrThrow(teamId);
    const members = await this.prisma.teamMember.findMany({
      where: { teamId, isActive: true },
      include: TEAM_MEMBER_INCLUDE,
      orderBy: { joinedAt: 'asc' },
    });
    return { data: members.map(toTeamMember) };
  }

  async addMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
    await this.findTeamOrThrow(teamId);
    await this.assertUserExists(dto.userId);

    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: dto.userId } },
    });
    if (existing?.isActive) {
      throw new ConflictError('This user is already a member of the team.');
    }

    const member = existing
      ? await this.prisma.teamMember.update({
          where: { id: existing.id },
          data: { isActive: true, membershipRole: dto.membershipRole, joinedAt: new Date() },
          include: TEAM_MEMBER_INCLUDE,
        })
      : await this.prisma.teamMember.create({
          data: { teamId, userId: dto.userId, membershipRole: dto.membershipRole },
          include: TEAM_MEMBER_INCLUDE,
        });
    return toTeamMember(member);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.findTeamOrThrow(teamId);
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!existing?.isActive) {
      throw new NotFoundError('This user is not an active member of the team.');
    }

    await this.prisma.teamMember.update({
      where: { id: existing.id },
      data: { isActive: false },
    });
  }

  private async findTeamOrThrow(id: string): Promise<TeamWithRelations> {
    const team = await this.prisma.team.findUnique({ where: { id }, include: TEAM_INCLUDE });
    if (!team) {
      throw new NotFoundError('Team not found.');
    }
    return team;
  }

  private async memberCountsFor(teamIds: string[]): Promise<Map<string, number>> {
    if (teamIds.length === 0) {
      return new Map();
    }
    const groups = await this.prisma.teamMember.groupBy({
      by: ['teamId'],
      where: { isActive: true, teamId: { in: teamIds } },
      _count: { _all: true },
    });
    return new Map(groups.map((group) => [group.teamId, group._count._all]));
  }

  private async assertNoDuplicateName(name: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.team.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (existing) {
      throw new ConflictError(`A team named "${name}" already exists.`);
    }
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }
  }
}
