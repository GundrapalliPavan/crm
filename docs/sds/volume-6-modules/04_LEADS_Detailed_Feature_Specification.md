# 04_LEADS.md

# Lead Management -- Detailed Feature Specification

**Project:** CRM Platform\
**Module:** Lead Management\
**Version:** 1.0

------------------------------------------------------------------------

# 1. Purpose

Lead Management is the core module of the CRM. It manages the complete
lifecycle of a sales opportunity---from creation through qualification,
site visits, follow-ups, quotation, conversion into a customer, or
closure.

------------------------------------------------------------------------

# 2. Business Goals

-   Capture leads from multiple sources.
-   Assign leads to sales executives.
-   Track every interaction.
-   Schedule follow-ups.
-   Convert qualified leads into customers.
-   Maintain a complete audit trail.

------------------------------------------------------------------------

# 3. Lead Lifecycle

New → Assigned → Contacted → Qualified → Site Visit Scheduled → Site
Visit Completed → Proposal Sent → Negotiation → Won (Convert to
Customer)

OR

→ Lost → Closed

------------------------------------------------------------------------

# 4. User Stories

### Sales Executive

-   View assigned leads.
-   Update lead status.
-   Record visit.
-   Add notes.
-   Schedule follow-up.

### Sales Manager

-   Create leads.
-   Assign leads.
-   Reassign leads.
-   View team pipeline.
-   Approve conversions (optional).

### Admin

-   Configure lead statuses.
-   Configure lead sources.
-   Import/export leads.

------------------------------------------------------------------------

# 5. Screens

1.  Lead List
2.  Create Lead
3.  Edit Lead
4.  Lead Details
5.  Timeline
6.  Visit History
7.  Notes
8.  Attachments
9.  Follow-ups
10. Convert to Customer

------------------------------------------------------------------------

# 6. Lead Fields

## Basic

-   Lead Number (Auto)
-   Company Name
-   Contact Name
-   Phone
-   Email
-   Address
-   City
-   State
-   Country

## Business

-   Lead Source
-   Lead Status
-   Assigned To
-   Expected Value
-   Expected Close Date
-   Industry
-   Priority

## Additional

-   Website
-   GST/VAT (optional)
-   Remarks

------------------------------------------------------------------------

# 7. Validation

Required

-   Company Name
-   Contact Name
-   Phone
-   Assigned User
-   Lead Status

Validate

-   Email format
-   Phone format
-   Duplicate phone/email within organization

------------------------------------------------------------------------

# 8. Business Rules

-   Every lead belongs to one organization.
-   Every lead has one owner.
-   Lead numbers are auto-generated.
-   Status changes are logged.
-   Leads cannot be converted twice.
-   Lost leads require a reason.

------------------------------------------------------------------------

# 9. Related Tables

-   leads
-   lead_status
-   lead_sources
-   visits
-   notes
-   activities
-   attachments
-   tasks
-   customers

------------------------------------------------------------------------

# 10. API Endpoints

GET /api/v1/leads

GET /api/v1/leads/{id}

POST /api/v1/leads

PATCH /api/v1/leads/{id}

DELETE /api/v1/leads/{id}

POST /api/v1/leads/{id}/assign

POST /api/v1/leads/{id}/convert

GET /api/v1/leads/{id}/timeline

------------------------------------------------------------------------

# 11. Notifications

Trigger notifications when:

-   Lead assigned
-   Follow-up due
-   Visit scheduled
-   Lead converted
-   Lead overdue

------------------------------------------------------------------------

# 12. Audit Log

Track:

-   Creation
-   Assignment
-   Status changes
-   Field edits
-   Conversion
-   Deletion (soft delete)

------------------------------------------------------------------------

# 13. RBAC

Super Admin - Full access

Admin - Full organization access

Sales Manager - Team leads

Sales Executive - Assigned leads only

Viewer - Read-only

------------------------------------------------------------------------

# 14. Reports

-   Leads by Status
-   Leads by Source
-   Leads by Executive
-   Conversion Rate
-   Average Conversion Time
-   Lost Lead Reasons

------------------------------------------------------------------------

# 15. Mobile App Behaviour

Sales Executive can:

-   View assigned leads
-   Update status
-   Add visit
-   Capture GPS
-   Add notes
-   Upload images
-   Schedule follow-up

------------------------------------------------------------------------

# 16. Edge Cases

-   Duplicate lead
-   Reassignment after visit
-   Conversion while another user edits
-   Missing phone
-   Invalid email
-   Deleted owner
-   Organization change (not allowed)

------------------------------------------------------------------------

# 17. Acceptance Criteria

-   CRUD operations complete.
-   Timeline maintained.
-   Visits linked correctly.
-   Conversion creates customer.
-   Notifications triggered.
-   Audit log recorded.
-   RBAC enforced.
-   Unit and integration tests pass.
