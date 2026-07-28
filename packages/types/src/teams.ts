/**
 * Team Management module contracts (Module 9 - PROJECT.md section 18,
 * technical/API.md section 102, technical/DATABASE.md sections 17-18).
 *
 * Scope for this pass, per explicit user direction: Teams & Reporting
 * Structure only. `Team`/`TeamMember` already existed in the schema since
 * Phase 0 and were completely unused - no migration was needed. This closes
 * the loop on two things deferred earlier: Lead.assignedTeamId (accepted
 * since Module 1 but never validated or surfaced in any UI) and the
 * `/reports/team-performance` endpoint (documented in API.md, explicitly
 * deferred in Module 7 because there was no way to create or assign a team).
 *
 * Territories, Tasks, Daily Activities, Attendance, GPS Check-ins, Meeting
 * Reports, Targets, Expense Claims, Leave and Travel Logs are explicitly
 * deferred - none have schema or an approved design, and several (Attendance,
 * Leave, Expense Claims, GPS tracking) raise business-policy questions that
 * have not been answered yet.
 */

import type { UserSummary } from './crm';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  manager: UserSummary | null;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  managerId?: string;
}

export type UpdateTeamRequest = Partial<CreateTeamRequest> & { isActive?: boolean };

export interface ListTeamsQuery {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface TeamMember {
  id: string;
  user: UserSummary;
  membershipRole: string | null;
  joinedAt: string;
  isActive: boolean;
}

export interface AddTeamMemberRequest {
  userId: string;
  membershipRole?: string;
}
