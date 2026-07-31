/**
 * CRM & Lead Management module contracts (Module 1 - see CRM.md, API.md
 * sections 38-48).
 *
 * Communication (WhatsApp/Email/SMS sending), Visits, Lead Scoring, record
 * merge and analytics are explicitly out of scope for this pass - CRM.md
 * section 92 phases them into later releases.
 */

export const LEAD_STATUSES = [
  'new',
  'attempted_contact',
  'connected',
  'qualified',
  'opportunity',
  'converted',
  'lost',
  'unqualified',
  'duplicate',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_PRIORITIES = ['low', 'medium', 'high'] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

/** CRM.md section 13. Distinct from CompanyType - classifies the lead's business at enquiry time. */
export const LEAD_TYPES = [
  'dealer',
  'distributor',
  'retailer',
  'builder',
  'contractor',
  'architect',
  'electrician',
  'corporate_customer',
  'project',
  'other',
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

/** CRM.md section 49. */
export const LEAD_LOST_REASONS = [
  'price',
  'competitor',
  'no_requirement',
  'no_response',
  'budget',
  'product_availability',
  'delivery_timeline',
  'credit_terms',
  'location',
  'duplicate',
  'invalid_lead',
  'other',
] as const;
export type LeadLostReason = (typeof LEAD_LOST_REASONS)[number];

/** CRM.md section 28 / DATABASE.md section 28. */
export const LEAD_ACTIVITY_TYPES = [
  'created',
  'assigned',
  'status_changed',
  'call',
  'meeting',
  'note',
  'follow_up',
  'quotation_created',
  'converted',
] as const;
export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number];

/** CRM.md sections 25, 27, 30. `overdue` is derived, never persisted. */
export const FOLLOW_UP_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export const FOLLOW_UP_TYPES = ['call', 'meeting', 'visit', 'email', 'whatsapp', 'other'] as const;
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

/** CRM.md sections 54-55 / DATABASE.md section 32. */
export const COMPANY_TYPES = [
  'dealer',
  'distributor',
  'retailer',
  'contractor',
  'builder',
  'business_customer',
  'other',
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

/** Lightweight reference, embedded wherever a full record would be wasteful (API.md "Expand Pattern"). */
export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TeamSummary {
  id: string;
  name: string;
}

export interface LeadSourceSummary {
  id: string;
  name: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  companyType: CompanyType;
}

export interface ContactSummary {
  id: string;
  firstName: string;
  lastName: string | null;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  companyName: string | null;
  phone: string | null;
  alternatePhone: string | null;
  email: string | null;
  source: LeadSourceSummary | null;
  leadType: LeadType | null;
  status: LeadStatus;
  priority: LeadPriority;
  assignee: UserSummary | null;
  assignedTeam: TeamSummary | null;
  estimatedValue: string | null;
  currencyCode: string;
  notes: string | null;
  nextFollowUpAt: string | null;
  convertedAt: string | null;
  convertedContact: ContactSummary | null;
  convertedCompany: CompanySummary | null;
  lostReason: LeadLostReason | null;
  lostNotes: string | null;
  lostAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  sourceId?: string;
  leadType: LeadType;
  priority?: LeadPriority;
  assignedTo?: string;
  assignedTeamId?: string;
  estimatedValue?: string;
  notes?: string;
  nextFollowUpAt?: string;
  /** CRM.md section 45 - explicit override to proceed despite a detected duplicate. */
  confirmDuplicate?: boolean;
}

export type UpdateLeadRequest = Partial<Omit<CreateLeadRequest, 'confirmDuplicate'>>;

export interface AssignLeadRequest {
  userId?: string;
  teamId?: string;
}

export interface LeadStatusTransitionRequest {
  status: LeadStatus;
  /** Required when status is 'lost'. */
  lostReason?: LeadLostReason;
  notes?: string;
}

export interface ConvertLeadRequest {
  /** Links to an existing company/contact instead of creating new ones (CRM.md section 47: "do not duplicate"). */
  companyId?: string;
  contactId?: string;
  /** Used only when companyId is not supplied. */
  company?: { name: string; companyType: CompanyType };
  contact?: { firstName: string; lastName?: string };
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: LeadActivityType;
  title: string;
  description: string | null;
  performedBy: UserSummary | null;
  activityAt: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateLeadActivityRequest {
  activityType: LeadActivityType;
  title: string;
  description?: string;
  activityAt?: string;
}

export interface FollowUp {
  id: string;
  leadId: string | null;
  contactId: string | null;
  companyId: string | null;
  assignee: UserSummary;
  followUpType: FollowUpType;
  scheduledAt: string;
  status: FollowUpStatus;
  /** Derived: scheduledAt is in the past and status is still 'pending'. Not a stored column. */
  isOverdue: boolean;
  notes: string | null;
  outcome: string | null;
  completedAt: string | null;
  /** MOBILE_ARCHITECTURE.md section 6, Option A. Null for every followUpType other than 'visit'. */
  checkInAt: string | null;
  checkInLatitude: string | null;
  checkInLongitude: string | null;
  checkOutAt: string | null;
  checkOutLatitude: string | null;
  checkOutLongitude: string | null;
  createdAt: string;
}

export interface CreateFollowUpRequest {
  leadId?: string;
  contactId?: string;
  companyId?: string;
  assignedTo: string;
  followUpType: FollowUpType;
  scheduledAt: string;
  notes?: string;
}

export type UpdateFollowUpRequest = Partial<Omit<CreateFollowUpRequest, 'leadId' | 'contactId' | 'companyId'>>;

export interface CompleteFollowUpRequest {
  outcome?: string;
  notes?: string;
  /** MOBILE_ARCHITECTURE.md section 6 - only meaningful when completing a checked-in 'visit'. */
  checkOutLatitude?: string;
  checkOutLongitude?: string;
  /** CRM.md section 27 - encourages scheduling the next action in the same flow. */
  nextFollowUp?: CreateFollowUpRequest;
}

/** MOBILE_ARCHITECTURE.md section 6, Option A - check-in on a 'visit'-type follow-up. */
export interface CheckInFollowUpRequest {
  latitude?: string;
  longitude?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  jobTitle: string | null;
  phone: string | null;
  alternatePhone: string | null;
  email: string | null;
  company: CompanySummary | null;
  isPrimary: boolean;
  owner: UserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName?: string;
  jobTitle?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  companyId?: string;
  isPrimary?: boolean;
  ownerId?: string;
  confirmDuplicate?: boolean;
}

export type UpdateContactRequest = Partial<Omit<CreateContactRequest, 'confirmDuplicate'>>;

export interface Company {
  id: string;
  name: string;
  companyType: CompanyType;
  phone: string | null;
  email: string | null;
  website: string | null;
  gstin: string | null;
  taxIdentifier: string | null;
  /** Normalised GST state code (e.g. "36"), used to determine CGST+SGST vs IGST on invoices. */
  stateCode: string | null;
  owner: UserSummary | null;
  creditLimit: string | null;
  paymentTermsDays: number | null;
  isCustomer: boolean;
  isSupplier: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  companyType: CompanyType;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  taxIdentifier?: string;
  stateCode?: string;
  ownerId?: string;
  creditLimit?: string;
  paymentTermsDays?: number;
  isCustomer?: boolean;
  isSupplier?: boolean;
  confirmDuplicate?: boolean;
}

export type UpdateCompanyRequest = Partial<Omit<CreateCompanyRequest, 'confirmDuplicate'>>;
