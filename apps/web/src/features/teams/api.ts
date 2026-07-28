import type {
  AddTeamMemberRequest,
  ApiCollectionResponse,
  CreateTeamRequest,
  ListTeamsQuery,
  Team,
  TeamMember,
  UpdateTeamRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const teamsApi = {
  async list(query: ListTeamsQuery): Promise<ApiCollectionResponse<Team>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Team>>('/teams', { params: query });
    return data;
  },

  async getById(id: string): Promise<Team> {
    const { data } = await apiClient.get<Team>(`/teams/${id}`);
    return data;
  },

  async create(request: CreateTeamRequest): Promise<Team> {
    const { data } = await apiClient.post<Team>('/teams', request);
    return data;
  },

  async update(id: string, request: UpdateTeamRequest): Promise<Team> {
    const { data } = await apiClient.patch<Team>(`/teams/${id}`, request);
    return data;
  },

  async listMembers(teamId: string): Promise<{ data: TeamMember[] }> {
    const { data } = await apiClient.get<{ data: TeamMember[] }>(`/teams/${teamId}/members`);
    return data;
  },

  async addMember(teamId: string, request: AddTeamMemberRequest): Promise<TeamMember> {
    const { data } = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, request);
    return data;
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },
};
