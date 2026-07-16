# Lead Management - Enterprise Implementation Specification

**Project:** CRM Platform **Module:** Lead Management **Document:**
LEAD_MANAGEMENT_ENTERPRISE_SPECIFICATION.md **Version:** 2.0

> This document is the implementation blueprint for the Lead Management
> module. It should be treated as the authoritative reference for UX,
> database, APIs, backend, frontend, mobile and QA.

# 1. Business Purpose

Lead Management is the central workflow of the CRM. Every sales
opportunity starts as a Lead and progresses through qualification,
visits, proposal, negotiation and either conversion or closure.

# 2. Objectives

-   Centralize lead capture
-   Eliminate duplicate leads
-   Track complete sales history
-   Improve conversion rate
-   Enable field sales
-   Provide management visibility

# 3. Actors

-   Super Admin
-   Organization Admin
-   Sales Manager
-   Sales Executive
-   Finance (read only after conversion)

# 4. Lead Lifecycle

New → Assigned → Contacted → Qualified → Visit Scheduled → Visit
Completed → Proposal Sent → Negotiation → Won (Customer)

Alternative:

New → Assigned → Contacted → Lost → Closed

# 5. Business Workflow

1.  Lead created
2.  Duplicate check
3.  Assign owner
4.  Notify owner
5.  Sales executive contacts lead
6.  Visit scheduled
7.  Visit completed
8.  Follow-up(s)
9.  Proposal
10. Negotiation
11. Won → Customer created automatically
12. Lost → Mandatory reason

# 6. Lead Data Dictionary

## Identification

-   Lead Number (System Generated)
-   Organization
-   Owner
-   Source
-   Status

## Customer Information

-   Company Name
-   Contact Person
-   Designation
-   Phone
-   Alternate Phone
-   Email
-   Website

## Address

-   Address Line 1
-   Address Line 2
-   City
-   State
-   Country
-   Postal Code

## Business

-   Industry
-   Expected Revenue
-   Probability %
-   Expected Close Date
-   Priority
-   Remarks

# 7. Screen Specifications

## Lead List

Features: - Search - Advanced Filters - Saved Views (future) - Bulk
Assignment - Bulk Export - Pagination - Column Chooser

Columns: Lead No Company Contact Owner Status Source Expected Value
Created Date Actions

## Lead Details

Sections: - Summary - Timeline - Visits - Notes - Tasks - Attachments -
Activities - Orders (after conversion)

## Create Lead

Validation: - Required fields highlighted - Duplicate detection before
save - Inline validation - Autosave draft (future)

# 8. Field Validation

Company Name: - Required - Max 150 chars

Phone: - Required - Numeric - Duplicate check

Email: - Optional - RFC compliant

Expected Revenue: - Positive decimal only

# 9. State Transition Rules

New -\> Assigned ✔ Assigned -\> Contacted ✔ Contacted -\> Qualified ✔
Qualified -\> Visit Scheduled ✔ Visit Scheduled -\> Visit Completed ✔
Visit Completed -\> Proposal Sent ✔ Proposal Sent -\> Negotiation ✔
Negotiation -\> Won ✔ Negotiation -\> Lost ✔

Illegal transitions should be rejected.

# 10. Notifications

Trigger: - Lead Assigned - Follow-up Due - Visit Tomorrow - Lead Won -
Lead Lost - Lead Idle \> 7 days

Channels: - In-App - Email (future) - Push Notification (mobile)

# 11. Audit Events

Capture: - Create - Update - Assign - Status Change - Owner Change -
Convert - Delete (Soft) - Restore

# 12. APIs

GET /api/v1/leads GET /api/v1/leads/{id} POST /api/v1/leads PATCH
/api/v1/leads/{id} DELETE /api/v1/leads/{id} POST
/api/v1/leads/{id}/assign POST /api/v1/leads/{id}/convert GET
/api/v1/leads/{id}/timeline

# 13. Database Mapping

Table: leads Primary Key: id

Relationships: - users - lead_status - lead_sources - visits - notes -
activities - attachments - tasks

# 14. Mobile Behaviour

Allowed: - View assigned leads - Update status - Add notes - Create
visit - Capture GPS - Upload photos - Schedule follow-up

Not Allowed: - Delete lead - Change ownership - Configure master data

# 15. Reports

-   Lead Funnel
-   Conversion %
-   Average Time to Convert
-   Leads by Executive
-   Leads by Source
-   Lost Reason Analysis
-   Visit Productivity

# 16. Edge Cases

-   Duplicate phone
-   Duplicate email
-   Deleted owner
-   Simultaneous edits
-   Lead converted twice
-   Invalid status transition
-   Missing internet during mobile update

# 17. QA Test Scenarios

-   Create valid lead
-   Create duplicate lead
-   Assign lead
-   Reassign lead
-   Complete visit
-   Convert lead
-   Lose lead
-   Export leads
-   Permission validation
-   Mobile sync

# 18. Acceptance Criteria

-   CRUD completed
-   Timeline operational
-   Visit integration complete
-   Notifications sent
-   Audit logs generated
-   Mobile supported
-   RBAC enforced
-   Unit tests passing
-   Integration tests passing
-   E2E workflow verified

# 19. Future Enhancements

-   AI lead scoring
-   WhatsApp integration
-   Automatic reminders
-   OCR business card capture
-   Voice notes
-   Geo-fencing
-   Duplicate merge
