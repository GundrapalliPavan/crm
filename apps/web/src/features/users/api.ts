import type {
  ApiCollectionResponse,
  AssignUserRolesRequest,
  AuthenticatedUser,
  CreateUserRequest,
  CreateUserResponse,
  PermissionSummary,
  RoleSummary,
  UpdateUserStatusRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
}

export const usersApi = {
  async list(query: ListUsersQuery): Promise<ApiCollectionResponse<AuthenticatedUser>> {
    const { data } = await apiClient.get<ApiCollectionResponse<AuthenticatedUser>>('/users', { params: query });
    return data;
  },

  async create(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { data } = await apiClient.post<CreateUserResponse>('/users', request);
    return data;
  },

  async updateStatus(id: string, request: UpdateUserStatusRequest): Promise<AuthenticatedUser> {
    const { data } = await apiClient.patch<AuthenticatedUser>(`/users/${id}/status`, request);
    return data;
  },

  async assignRoles(id: string, request: AssignUserRolesRequest): Promise<AuthenticatedUser> {
    const { data } = await apiClient.patch<AuthenticatedUser>(`/users/${id}/roles`, request);
    return data;
  },
};

export const rolesApi = {
  async listRoles(): Promise<{ data: RoleSummary[] }> {
    const { data } = await apiClient.get<{ data: RoleSummary[] }>('/roles');
    return data;
  },

  async listPermissions(): Promise<{ data: PermissionSummary[] }> {
    const { data } = await apiClient.get<{ data: PermissionSummary[] }>('/permissions');
    return data;
  },
};
