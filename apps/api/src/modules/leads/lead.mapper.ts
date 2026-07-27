import type {
  Lead as PrismaLead,
  LeadActivity as PrismaLeadActivity,
  LeadSource,
  User,
  Team,
  Contact,
  Company,
} from '@prisma/client';
import type { Lead, LeadActivity } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;
type TeamRef = Pick<Team, 'id' | 'name'>;
type ContactRef = Pick<Contact, 'id' | 'firstName' | 'lastName'>;
type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;

export type LeadWithRelations = PrismaLead & {
  source: Pick<LeadSource, 'id' | 'name'> | null;
  assignee: UserRef | null;
  assignedTeam: TeamRef | null;
  convertedContact: ContactRef | null;
  convertedCompany: CompanyRef | null;
};

/** Relations every lead read needs, kept in one place so list/detail never drift apart. */
export const LEAD_INCLUDE = {
  source: { select: { id: true, name: true } },
  assignee: { select: { id: true, firstName: true, lastName: true } },
  assignedTeam: { select: { id: true, name: true } },
  convertedContact: { select: { id: true, firstName: true, lastName: true } },
  convertedCompany: { select: { id: true, name: true, companyType: true } },
} as const;

export function toLead(lead: LeadWithRelations): Lead {
  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    companyName: lead.companyName,
    phone: lead.phone,
    alternatePhone: lead.alternatePhone,
    email: lead.email,
    source: lead.source,
    leadType: lead.leadType,
    status: lead.status,
    priority: lead.priority,
    assignee: lead.assignee,
    assignedTeam: lead.assignedTeam,
    estimatedValue: lead.estimatedValue?.toString() ?? null,
    currencyCode: lead.currencyCode,
    notes: lead.notes,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    convertedAt: lead.convertedAt?.toISOString() ?? null,
    convertedContact: lead.convertedContact,
    convertedCompany: lead.convertedCompany,
    lostReason: lead.lostReason,
    lostNotes: lead.lostNotes,
    lostAt: lead.lostAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export const LEAD_ACTIVITY_INCLUDE = {
  performer: { select: { id: true, firstName: true, lastName: true } },
} as const;

/** `performer` is the expanded relation; the raw `performedBy` FK column is not exposed. */
export type LeadActivityWithRelations = PrismaLeadActivity & { performer: UserRef | null };

export function toLeadActivity(activity: LeadActivityWithRelations): LeadActivity {
  return {
    id: activity.id,
    leadId: activity.leadId,
    activityType: activity.activityType,
    title: activity.title,
    description: activity.description,
    performedBy: activity.performer,
    activityAt: activity.activityAt.toISOString(),
    metadata: (activity.metadata as Record<string, unknown> | null) ?? null,
    createdAt: activity.createdAt.toISOString(),
  };
}
