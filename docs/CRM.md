CRM.md

Electrical Distribution CRM — CRM Module Specification

Version: 1.0
Status: Product Definition
Module: CRM
Parent Document: PROJECT.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The CRM module is the central relationship and lead-management layer of the Electrical Distribution CRM.

Its purpose is to help the organization capture, organize, assign, track, communicate with, follow up with, and convert potential business opportunities while maintaining a complete history of relationships with customers and business contacts.

The CRM should answer:

* Who are we doing business with?
* Who might become a customer?
* Who owns the relationship?
* What happened previously?
* What communication has taken place?
* What needs to happen next?
* When should someone follow up?
* How valuable is the opportunity?
* Why are opportunities being lost?
* Which salesperson is responsible?
* What should management pay attention to?

The CRM must be action-oriented rather than simply functioning as a database.

⸻

2. CRM Product Goal

The primary goal is:

Ensure that no valuable lead, customer relationship, communication, visit, or follow-up is lost because information is scattered across people, spreadsheets, phones, WhatsApp, email, or notebooks.

The CRM should become the primary working environment for the sales team.

⸻

3. CRM Scope

The CRM module includes:

* Leads
* Lead Pipeline
* Lead Assignment
* Lead Qualification
* Lead Conversion
* Contacts
* Accounts / Business Customers
* Dealers
* Distributors
* Retailers
* Builders
* Contractors
* Architects
* Electricians
* Corporate Customers
* Activities
* Follow-ups
* Tasks
* Calls
* Meetings
* Visits
* Notes
* Attachments
* Communication History
* Unified Timeline
* Tags
* Lead Sources
* Lead Priorities
* Territories
* Ownership
* Duplicate Detection
* Lost Lead Tracking
* CRM Search
* CRM Views
* CRM Reports
* CRM Notifications
* CRM Automation

⸻

4. Out of Scope

The following are separate modules and should not be fully defined inside CRM:

* Product Catalogue
* Detailed Quotation Management
* Sales Orders
* Purchase Orders
* Inventory
* Billing
* Accounting
* Payments
* Customer Support
* Detailed Sales Reporting

CRM may display summaries or initiate workflows related to these modules.

Example:

Customer

→ View Quotations

is valid.

But quotation calculation and approval rules belong to the Sales module.

⸻

5. Primary Users

Sales Executive

Primary CRM user.

Needs to:

* View assigned leads
* Create leads
* Contact leads
* Schedule follow-ups
* Update lead status
* Record meetings
* Record customer visits
* Add notes
* Create tasks
* View customer history
* Convert leads

⸻

Field Sales Executive

Needs fast mobile-oriented workflows for:

* Today’s visits
* Assigned leads
* Nearby customers in future
* Customer details
* Call
* WhatsApp
* Check-in
* Meeting notes
* Voice notes in future
* Photos
* Follow-ups
* Lead updates

⸻

Sales Manager

Needs to:

* View team pipeline
* Assign leads
* Reassign leads
* Monitor follow-ups
* Identify unattended leads
* Monitor conversions
* Review lost leads
* Monitor salesperson activity
* Review lead ageing
* Track team performance

⸻

Branch Manager

Needs visibility into:

* Branch leads
* Branch customers
* Sales activity
* Conversion
* Follow-up performance
* Team performance

⸻

Management

Needs high-level visibility into:

* Lead volume
* Lead sources
* Conversion
* Pipeline
* Lost opportunities
* Sales-team activity
* Customer growth
* Business trends

⸻

Telecaller / Inside Sales

May need to:

* Work through assigned lead lists
* Make calls
* Record call outcome
* Schedule follow-up
* Update lead qualification
* Transfer qualified leads

⸻

6. CRM Domain Model

The CRM should distinguish between several important concepts.

Lead

A potential business opportunity that has not yet been qualified or converted into an established business relationship.

Example:

An electrician enquires about becoming a dealer.

A builder asks for pricing for a new project.

A retailer responds to a campaign.

⸻

Account

An organization or business entity the company has a relationship with.

Examples:

* Dealer
* Retailer
* Distributor
* Builder
* Contractor
* Architecture Firm
* Corporate Customer

An account may have multiple contacts.

⸻

Contact

An individual person associated with an account or operating independently.

Examples:

* Purchase Manager
* Store Owner
* Electrician
* Architect
* Contractor
* Accounts Manager

⸻

Customer

A customer is an account/contact that has established a commercial relationship with the organization.

Customer status should not require duplicating the same entity into another disconnected database.

⸻

7. Relationship Model

Preferred conceptual model:

Account
   │
   ├── Contact
   ├── Contact
   ├── Contact
   │
   ├── Activities
   ├── Communications
   ├── Opportunities
   ├── Quotations
   ├── Orders
   ├── Invoices
   └── Support History

A business should not need multiple duplicate records merely because it interacts with different departments.

⸻

8. Lead Lifecycle

A practical default lifecycle should be:

New
 ↓
Attempted Contact
 ↓
Connected
 ↓
Qualified
 ↓
Opportunity
 ↓
Converted

Alternative exits:

Lost
Unqualified
Duplicate

Stages should eventually be configurable.

Do not hardcode the entire product around one pipeline configuration.

⸻

9. Lead Status vs Lead Stage

Avoid mixing these concepts unnecessarily.

Stage describes where the lead is in the business process.

Status may describe operational state.

Example:

Stage:

Qualified

Operational status:

Follow-up Due

Do not create excessive overlapping statuses.

Keep the model understandable to sales users.

⸻

10. Lead Creation

Users should be able to create leads through:

* Manual Entry
* Quick Create
* Import
* Website Forms
* WhatsApp
* Email
* API
* Campaigns
* Referral
* Phone Enquiry
* Walk-in
* Future integrations

Every lead should record its source where available.

⸻

11. Quick Lead Creation

Sales users should not be forced through a long form.

Minimum practical information may include:

* Name / Business Name
* Phone
* Lead Type
* Source
* Assigned Salesperson

Optional information can be added later.

The system should optimize for:

Capture first → Enrich later

while still ensuring essential data quality.

⸻

12. Lead Information

Potential lead fields include:

Basic Information

* Lead ID
* Name
* Business Name
* Contact Person
* Phone
* Alternate Phone
* Email
* Lead Type
* Lead Source
* Priority
* Status
* Stage

Business Information

* Business Type
* GST Number where applicable
* Estimated Business Potential
* Product Interests
* Brands Interested
* Current Brands Used
* Requirement
* Expected Purchase Timeline

Location

* Address
* City
* State
* Postal Code
* Territory
* Branch

Ownership

* Assigned Salesperson
* Team
* Branch
* Territory

Follow-up

* Next Follow-up
* Follow-up Type
* Reminder
* Last Contacted

System Information

* Created By
* Created At
* Updated At
* Converted At
* Lost At

Do not expose all fields in the initial lead creation form.

⸻

13. Lead Types

Potential lead/business types:

* Dealer
* Distributor
* Retailer
* Builder
* Contractor
* Architect
* Electrician
* Corporate Customer
* Project
* Other

These values should eventually be configurable.

⸻

14. Lead Sources

Potential sources:

* Walk-in
* Phone
* WhatsApp
* Website
* Email
* Referral
* Sales Visit
* Exhibition
* Campaign
* Existing Customer
* Dealer Referral
* Social Media
* Google
* Other

Source tracking is important for reporting and marketing effectiveness.

⸻

15. Lead Priority

Default priorities may include:

* Low
* Medium
* High
* Urgent

Priority should not replace qualification or scoring.

Avoid creating too many priority levels.

⸻

16. Lead Qualification

Qualification should help answer:

* Is there a genuine requirement?
* What products are required?
* What is the expected business value?
* When is the requirement expected?
* Who is the decision maker?
* Is the prospect currently purchasing from competitors?
* What is the expected order frequency?
* What location/territory is involved?
* What should happen next?

Qualification should remain practical.

Do not force salespeople through lengthy questionnaires for every lead.

⸻

17. Lead Scoring

Lead scoring may be introduced when enough data exists to make it useful.

Possible factors:

* Business Type
* Estimated Value
* Requirement Timeline
* Engagement
* Number of Interactions
* Product Interest
* Location
* Existing Relationship
* Source Quality
* Salesperson Assessment

Initial versions may use simple rules.

Future versions may use predictive scoring.

Do not introduce AI scoring without sufficient data.

⸻

18. Lead Assignment

Leads should support:

* Manual Assignment
* Manager Assignment
* Reassignment
* Future Rule-based Assignment
* Future Territory-based Assignment
* Future Round-robin Assignment

Assignment history should be preserved where operationally useful.

⸻

19. Lead Ownership

Every active lead should normally have a clear owner.

Users should quickly understand:

* Who owns the lead?
* Which team?
* Which branch?
* Which territory?

Unassigned leads should be clearly visible to authorized users.

⸻

20. Lead Reassignment

Authorized users should be able to reassign leads.

Potential reasons:

* Territory Change
* Employee Leave
* Employee Exit
* Workload Balancing
* Manager Decision
* Customer Request

Important reassignment activity should appear in history.

⸻

21. Lead Pipeline

CRM should provide a visual pipeline.

Example:

New
|
Attempted Contact
|
Connected
|
Qualified
|
Opportunity
|
Converted

Users should be able to:

* View stage counts
* View estimated value
* Filter pipeline
* Open lead
* Move stage where permitted
* Identify ageing leads

Pipeline design should remain lightweight.

⸻

22. Pipeline Views

Support practical views such as:

* My Pipeline
* Team Pipeline
* Branch Pipeline
* All Pipeline

Filters may include:

* Owner
* Team
* Branch
* Territory
* Source
* Type
* Priority
* Product Interest
* Date
* Stage

⸻

23. Lead List

The lead list is likely to be one of the most frequently used CRM screens.

It should prioritize:

* Name
* Business
* Stage
* Priority
* Owner
* Next Follow-up
* Last Activity
* Age
* Potential Value

Users should be able to customize views where practical.

Avoid displaying every available field by default.

⸻

24. Saved Views

Useful default views may include:

* My Leads
* New Leads
* Follow-up Today
* Follow-up Overdue
* No Follow-up Scheduled
* High Priority
* Recently Assigned
* Uncontacted Leads
* Qualified Leads
* Lost Leads
* Unassigned Leads

Users may eventually create personal/team saved views.

⸻

25. Follow-ups

Follow-up management is one of the most important CRM capabilities.

Every active lead should ideally have a clear next action.

Follow-ups may include:

* Call
* WhatsApp
* Email
* Meeting
* Customer Visit
* Send Quotation
* Product Demo
* Collection Follow-up
* Other

⸻

26. Follow-up Philosophy

The system should encourage:

Complete Current Activity
        ↓
Record Outcome
        ↓
Define Next Action
        ↓
Schedule Follow-up

This prevents leads from becoming inactive unintentionally.

⸻

27. Follow-up Status

Possible states:

* Upcoming
* Due Today
* Overdue
* Completed
* Cancelled

Overdue follow-ups should be highly visible without making the interface visually aggressive.

⸻

28. Follow-up Reminders

Users should receive useful reminders.

Potential channels:

* In-App
* Email
* WhatsApp where appropriate
* Future Mobile Push

Avoid sending the same reminder through every channel by default.

Notification preferences should eventually be configurable.

⸻

29. Activities

CRM activities may include:

* Call
* WhatsApp
* Email
* Meeting
* Visit
* Note
* Task
* Follow-up
* File
* Status Change
* Assignment Change
* System Event

Activities should form part of the unified timeline.

⸻

30. Calls

Users should be able to record:

* Call Date/Time
* Incoming / Outgoing
* Outcome
* Duration where available
* Notes
* Next Action

Potential outcomes:

* Connected
* No Answer
* Busy
* Call Back
* Not Interested
* Wrong Number
* Qualified

Keep call logging fast.

⸻

31. Meetings

Meetings should support:

* Date
* Time
* Participants
* Location
* Purpose
* Notes
* Outcome
* Attachments
* Next Action

Future integration may synchronize with Google or Microsoft Calendar.

⸻

32. Customer / Dealer Visits

Visits are particularly important for electrical distribution sales.

A visit may include:

* Customer
* Dealer
* Lead
* Salesperson
* Planned Date
* Actual Date
* Check-in
* Check-out
* Location where appropriate
* Meeting Notes
* Products Discussed
* Photos
* Outcome
* Next Follow-up

Mobile should eventually optimize this workflow.

⸻

33. Visit Planning

Sales users should eventually be able to see:

* Today’s Visits
* Upcoming Visits
* Overdue Visits
* Completed Visits

Future enhancements may include:

* Beat Plans
* Route Planning
* Nearby Customers
* Territory Planning

These should not be introduced until required.

⸻

34. Tasks

Tasks may be associated with:

* Lead
* Account
* Contact
* Opportunity
* Customer
* Other CRM record

Task information may include:

* Title
* Assignee
* Due Date
* Priority
* Status
* Description
* Related Record

Avoid turning CRM task management into a full project-management system.

⸻

35. Notes

Users should be able to add internal notes.

Notes may include:

* Text
* Mentions
* Attachments

Internal notes should not automatically be visible to customers.

Important notes should record author and timestamp.

⸻

36. Attachments

CRM records may contain:

* Visiting Cards
* Customer Documents
* GST Certificates
* Requirement Documents
* Photos
* Product References
* Drawings
* Other Files

Files should use the shared storage infrastructure defined in PROJECT_SETUP.md.

⸻

37. Unified Timeline

Every important CRM record should provide a chronological timeline.

Example:

10:30 AM
Call completed
Customer requested revised pricing.
10:35 AM
Follow-up scheduled
Tomorrow, 11:00 AM.
Yesterday
WhatsApp quotation sent.
3 days ago
Lead assigned to Sales Executive.
5 days ago
Lead created from Website.

The timeline should answer:

What happened with this relationship?

⸻

38. Timeline Filtering

Users may filter timeline events by:

* All
* Communication
* Calls
* Meetings
* Visits
* Notes
* Tasks
* Documents
* System Activity

Do not overwhelm users with low-value technical events.

⸻

39. Communication Hub

CRM should connect to the shared communication infrastructure.

Users should eventually be able to initiate:

* WhatsApp
* Email
* SMS
* Calls

from relevant CRM records.

Communication should be associated with the correct:

* Lead
* Contact
* Account
* Customer

where technically possible.

⸻

40. WhatsApp

CRM use cases include:

* Initial Contact
* Follow-up
* Product Information
* Catalogue Sharing
* Quotation Sharing
* Meeting Confirmation
* Reminder
* General Customer Communication

Users should not manually copy phone numbers unnecessarily.

⸻

41. Email

CRM email use cases include:

* Introduction
* Follow-up
* Product Information
* Meeting Confirmation
* Documents
* Quotations

Communication history should be visible where integration permits.

⸻

42. SMS

SMS should primarily support transactional or high-value communication where WhatsApp/email may not be suitable.

Avoid using SMS unnecessarily due to cost and user experience.

⸻

43. Communication Composer

Future communication composer may allow users to:

* Select Channel
* Select Recipient
* Select Template
* Edit Message
* Add Attachment
* Send
* Schedule where supported

Context should be prefilled from the CRM record where possible.

⸻

44. Templates

Reusable communication templates may include:

* Lead Welcome
* Follow-up
* Meeting Confirmation
* Product Catalogue
* Quotation Follow-up
* Dealer Introduction

Templates should support variables such as:

{{customer_name}}
{{company_name}}
{{salesperson_name}}
{{followup_date}}

Do not build a complex campaign system inside basic CRM communication.

⸻

45. Duplicate Detection

Duplicate CRM data creates serious operational problems.

The system should identify possible duplicates using combinations such as:

* Phone
* Email
* Business Name
* GST Number

When a possible duplicate is found:

Do not silently create another record.

Provide users with:

* Existing record
* Matching reason
* Option to view
* Option to continue if permitted
* Future merge capability

⸻

46. Record Merge

Authorized users may eventually merge duplicate records.

Merge operations require careful handling of:

* Activities
* Contacts
* Communication
* Notes
* Attachments
* Ownership
* Related business records

Merge must be auditable.

This capability may be introduced after initial CRM implementation.

⸻

47. Lead Conversion

When a lead successfully progresses into a business relationship, users should be able to convert it.

Conversion may create or associate:

* Account
* Contact
* Customer Relationship
* Opportunity

Do not duplicate existing accounts or contacts during conversion.

⸻

48. Conversion Flow

Preferred experience:

Qualified Lead
      ↓
Convert
      ↓
Check Existing Account / Contact
      ↓
Create or Link
      ↓
Preserve Lead History
      ↓
Continue Sales Workflow

Lead history must remain accessible after conversion.

⸻

49. Lost Leads

When a lead is lost, capture a reason.

Possible reasons:

* Price
* Competitor
* No Requirement
* No Response
* Budget
* Product Availability
* Delivery Timeline
* Credit Terms
* Location
* Duplicate
* Invalid Lead
* Other

Reasons should eventually be configurable.

⸻

50. Lost Lead Notes

For meaningful opportunities, allow users to provide additional context.

Do not force lengthy notes for every low-value lead.

⸻

51. Reopening Leads

Authorized users should be able to reopen appropriate lost or inactive leads.

History should show:

* Previous loss
* Reopened date
* Reopened by
* New activity

Do not erase historical outcomes.

⸻

52. Lead Ageing

CRM should identify leads that remain inactive too long.

Useful indicators:

* Days Since Created
* Days in Current Stage
* Days Since Last Activity
* Days Since Last Contact

Management should be able to identify stalled leads.

⸻

53. Stale Leads

A lead may become stale when:

* No recent activity
* No future follow-up
* Excessive time in stage
* Repeated unsuccessful contact

Thresholds should eventually be configurable.

Stale does not automatically mean lost.

⸻

54. Accounts

An account represents a business relationship.

Potential account fields:

* Business Name
* Business Type
* GST Number
* Phone
* Email
* Website
* Addresses
* Branch
* Territory
* Assigned Salesperson
* Credit Information
* Tags
* Status

Detailed financial data may belong to Billing/Accounting modules.

⸻

55. Account Types

Potential account types:

* Dealer
* Distributor
* Retailer
* Builder
* Contractor
* Architect
* Corporate Customer
* Other

Avoid creating entirely separate CRM systems for each account type unless their workflows genuinely require it.

⸻

56. Contacts

Accounts may contain multiple contacts.

Example:

ABC Electricals
├── Rajesh — Owner
├── Priya — Accounts
└── Arun — Purchase Manager

Contact fields may include:

* Name
* Job Title / Role
* Phone
* WhatsApp Number
* Email
* Preferred Communication
* Primary Contact
* Notes

⸻

57. Independent Contacts

Some contacts, such as individual electricians or contractors, may not belong to a formal business account.

The CRM should support this without requiring fake company records.

⸻

58. Customer 360

The customer/account detail experience should eventually provide a complete relationship view.

Potential sections:

* Overview
* Contacts
* Activities
* Communication
* Opportunities
* Quotations
* Orders
* Invoices
* Outstanding
* Visits
* Documents
* Support

Do not load every section’s full dataset simultaneously.

⸻

59. Customer Overview

The overview should prioritize actionable information:

* Relationship Owner
* Customer Type
* Contact Details
* Current Status
* Outstanding
* Last Order
* Last Contact
* Next Follow-up
* Recent Activity

Avoid filling the overview with low-value statistics.

⸻

60. Product Interests

Leads and customers may have interest in:

* Lights
* Fans
* Wires
* Switches
* Specific Brands
* Specific Products

Product interests can support:

* Qualification
* Follow-up
* Reporting
* Sales opportunities
* Future recommendations

⸻

61. Territories

CRM should support sales territories.

Territories may eventually relate to:

* Geography
* Branch
* Sales Team
* Salesperson

Examples:

* Hyderabad North
* Hyderabad South
* Telangana Dealers
* Andhra Pradesh Projects

Territory design should remain configurable.

⸻

62. Tags

Tags provide lightweight classification.

Examples:

* High Potential
* Premium Dealer
* Project Customer
* New Dealer
* Architect
* Priority Follow-up

Avoid using tags as a replacement for structured fields.

⸻

63. Search

CRM search should quickly locate records using information such as:

* Name
* Business Name
* Phone
* Email
* Lead ID
* Customer ID
* GST Number

Search should tolerate practical formatting differences where feasible.

⸻

64. Quick Actions

Common CRM quick actions may include:

* Add Lead
* Add Contact
* Add Customer
* Call
* WhatsApp
* Email
* Add Note
* Create Task
* Schedule Follow-up
* Schedule Visit

Quick actions should reduce navigation.

⸻

65. CRM Home

CRM home should prioritize work rather than generic statistics.

Potential areas:

My Work

* Follow-ups Today
* Overdue Follow-ups
* New Assigned Leads
* Tasks Today
* Visits Today

Pipeline

* New
* Connected
* Qualified
* Opportunity

Attention Required

* Uncontacted Leads
* Stale Leads
* Leads Without Follow-up
* High-value Leads Without Recent Activity

Recent Activity

* Recently Contacted
* Recently Updated
* Recently Assigned

⸻

66. My Day

A dedicated daily-work experience may combine:

* Follow-ups
* Tasks
* Calls
* Meetings
* Visits
* New Assignments

The goal is:

Open CRM → Know what to do next.

This may eventually become especially important for the mobile application.

⸻

67. CRM Notifications

Useful notifications include:

* Lead Assigned
* Lead Reassigned
* Follow-up Due
* Follow-up Overdue
* Meeting Reminder
* Visit Reminder
* Task Assigned
* Mention
* High-priority Lead
* Manager Escalation

Avoid notifications for routine low-value record changes.

⸻

68. CRM Automation

Potential automation includes:

New Lead

Lead Created
↓
Check Duplicate
↓
Assign Salesperson
↓
Notify Salesperson
↓
Create Initial Follow-up

No Contact

Lead Assigned
↓
No Activity Within Defined Period
↓
Notify Salesperson
↓
Escalate if Required

Follow-up Overdue

Follow-up Missed
↓
Notify Owner
↓
Remain Overdue
↓
Escalate Based on Rules

Automation should be transparent and configurable.

⸻

69. CRM Permissions

Potential permissions include:

crm.lead.view
crm.lead.create
crm.lead.update
crm.lead.delete
crm.lead.assign
crm.lead.convert
crm.account.view
crm.account.create
crm.account.update
crm.contact.view
crm.contact.create
crm.contact.update
crm.activity.create
crm.activity.update
crm.export
crm.import

Exact naming should align with the project’s final RBAC convention.

⸻

70. Record Visibility

Visibility may depend on:

* Organization
* Branch
* Team
* Territory
* Ownership
* Permission

Example:

Sales Executive:

May primarily see own leads.

Sales Manager:

May see team leads.

Branch Manager:

May see branch leads.

Management:

May see organization-wide data.

Backend must enforce these rules.

⸻

71. Import

CRM should eventually support imports for:

* Leads
* Contacts
* Accounts

Likely format:

* CSV
* Spreadsheet-compatible CSV

Import should include:

* Column Mapping
* Validation
* Duplicate Detection
* Error Report
* Import Summary

Large imports should use background processing.

⸻

72. Export

Authorized users may export CRM data.

Export should respect:

* Permissions
* Filters
* Organization boundaries

Sensitive exports should be auditable where appropriate.

⸻

73. Bulk Actions

Potential bulk actions:

* Assign
* Reassign
* Add Tag
* Change Priority
* Export

Avoid bulk actions that can easily damage historical data.

Bulk deletion should require careful consideration.

⸻

74. Audit History

Important CRM changes may require audit history.

Examples:

* Owner Changed
* Stage Changed
* Lead Converted
* Lead Lost
* Lead Reopened
* Account Details Changed
* Data Exported
* Records Merged

Audit history should not overwhelm the normal activity timeline.

⸻

75. CRM Analytics

CRM analytics should focus on actionable sales-management questions.

Potential metrics:

* Leads Created
* Leads by Source
* Leads by Type
* Leads by Salesperson
* Leads by Branch
* Conversion Rate
* Lost Rate
* Follow-up Completion
* Overdue Follow-ups
* Average Lead Age
* Stage Age
* Source Conversion
* Salesperson Conversion

Detailed revenue reporting belongs primarily to Sales/Reports.

⸻

76. Lead Source Effectiveness

Management should eventually understand:

Source
→ Leads
→ Qualified
→ Converted
→ Conversion Rate

This helps determine which acquisition channels generate useful business.

⸻

77. Salesperson CRM Performance

Useful operational indicators may include:

* Assigned Leads
* Contacted Leads
* Follow-ups Completed
* Overdue Follow-ups
* Visits
* Qualified Leads
* Converted Leads
* Lost Leads

Avoid using raw activity volume alone as a measure of employee performance.

Quality and outcomes matter.

⸻

78. CRM Data Quality

The system should improve data quality without creating excessive user friction.

Consider:

* Required minimum fields
* Duplicate detection
* Phone validation
* Email validation
* Structured addresses
* GST validation where applicable
* Controlled values for important classifications

Do not make every field mandatory.

⸻

79. CRM Mobile Experience

Future mobile CRM should prioritize:

Today
Leads
Customers
Visits
Tasks
Communication
Quick Create
Notifications

Mobile should optimize for fast actions.

⸻

80. Mobile Lead Card

A mobile lead card may prioritize:

* Name
* Business
* Priority
* Stage
* Next Follow-up
* Owner
* Call
* WhatsApp

Avoid squeezing desktop table information onto mobile.

⸻

81. Mobile Visit Workflow

Preferred conceptual workflow:

Today's Visit
↓
Open Customer
↓
Navigate / Call
↓
Check In
↓
Meeting
↓
Add Notes / Voice / Photos
↓
Select Outcome
↓
Schedule Next Action
↓
Complete Visit

Aim to minimize typing.

⸻

82. Offline Readiness

Future mobile CRM may require limited offline access for:

* Today’s Visits
* Assigned Leads
* Customer Details
* Notes
* Follow-ups
* Visit Outcomes

Offline support should be introduced selectively.

The backend remains authoritative.

⸻

83. CRM Integrations

Potential CRM integrations include:

Communication

* WhatsApp
* Email
* SMS
* Calling

Productivity

* Google Calendar
* Microsoft Calendar

Location

* Google Maps
* Google Places

Lead Capture

* Website Forms
* APIs
* Campaign Platforms
* Future Advertising Integrations

Integrations should use the shared infrastructure defined in PROJECT_SETUP.md.

⸻

84. AI Opportunities

Potential future AI capabilities:

* Lead Summary
* Customer Summary
* Suggested Next Action
* Follow-up Draft
* WhatsApp Draft
* Email Draft
* Meeting Summary
* Voice Note Summary
* Lead Scoring
* Duplicate Suggestions
* Lost Lead Analysis

AI should assist salespeople rather than hide decision-making.

⸻

85. Empty States

Examples:

No Leads

Explain how leads enter the CRM.

Actions:

* Add Lead
* Import Leads

No Follow-ups Today

Communicate that no follow-ups are currently scheduled.

Do not force an action unnecessarily.

No Activity

Encourage:

* Call
* WhatsApp
* Add Note
* Schedule Follow-up

where appropriate.

⸻

86. Error States

CRM workflows should handle:

* Network Error
* Failed Save
* Duplicate Record
* Invalid Phone
* Invalid Email
* Permission Denied
* Record Changed by Another User
* Communication Failure
* File Upload Failure

Users should understand what happened and what they can do next.

⸻

87. Loading States

Use appropriate:

* Skeletons
* Progressive Loading
* Button Progress
* Background Status

Avoid blocking the entire CRM interface for small operations.

⸻

88. Success Feedback

Confirm important actions such as:

* Lead Created
* Lead Assigned
* Follow-up Scheduled
* Lead Converted
* Message Sent
* Visit Completed

Avoid excessive success popups for trivial updates.

⸻

89. CRM UX Principles

CRM design must prioritize:

* Speed
* Clarity
* Actionability
* Minimal Data Entry
* Clear Ownership
* Clear Next Action
* Complete History
* Easy Search
* Fast Communication

Every CRM screen should answer:

What does this user need to know and do here?

⸻

90. CRM Design Principle

The CRM should not force salespeople to become data-entry operators.

Where possible:

* Prefill known information
* Remember useful preferences
* Use smart defaults
* Reuse existing customer information
* Reduce duplicate entry
* Capture activity automatically when reliable
* Allow quick updates

Good CRM data should be a natural outcome of doing work.

⸻

91. CRM Success Metrics

Potential product metrics include:

* Lead Response Time
* First Contact Time
* Follow-up Completion Rate
* Overdue Follow-up Rate
* Lead Conversion Rate
* Lead Age
* Stage Age
* Lost Lead Rate
* Leads Without Next Action
* Duplicate Rate
* Salesperson Adoption
* Daily CRM Usage
* Customer Visit Completion

The objective is better sales execution, not merely more CRM activity.

⸻

92. Initial CRM Release Priorities

The initial CRM implementation should prioritize the workflows that provide the most operational value.

Recommended order:

CRM Foundation

* Leads
* Accounts
* Contacts
* Ownership
* Basic Permissions

Daily Sales Execution

* Activities
* Follow-ups
* Tasks
* Notes
* Timeline

Pipeline

* Stages
* Pipeline View
* Saved Views
* Filters

Communication

* Communication Infrastructure Connection
* WhatsApp
* Email
* Communication History

Conversion

* Qualification
* Lead Conversion
* Lost Leads
* Duplicate Handling

Field Sales

* Visits
* Mobile-ready Workflows
* Location-assisted Features where approved

CRM Intelligence

* Analytics
* Automation
* Advanced Scoring
* AI Assistance

This order is a product recommendation and should be reconciled with the approved overall development roadmap before implementation.

⸻

93. CRM Screen Inventory

The likely CRM UX will eventually require screens or major views for:

* CRM Home / My Day
* Lead List
* Lead Pipeline
* Lead Detail
* Create Lead
* Edit Lead
* Follow-ups
* Tasks
* Visits
* Accounts List
* Account Detail / Customer 360
* Contacts List
* Contact Detail
* Import
* Duplicate Review
* CRM Analytics
* Saved Views
* CRM Settings where applicable

This is a screen inventory, not an instruction to design or build all screens immediately.

⸻

94. Lead Detail Information Architecture

A practical Lead Detail experience should likely contain:

Header

* Lead Name
* Business
* Stage
* Priority
* Owner
* Next Follow-up

Quick actions:

* Call
* WhatsApp
* Email
* Add Activity
* Schedule Follow-up
* More

Overview

* Contact
* Business Details
* Requirement
* Product Interest
* Source
* Territory
* Potential

Timeline

* Activities
* Communication
* Notes
* Meetings
* Visits
* Changes

Related

* Tasks
* Documents
* Future Quotations / Opportunities

Do not create excessive tabs for small amounts of information.

⸻

95. Account Detail Information Architecture

Potential structure:

Header

* Account Name
* Type
* Owner
* Status

Quick actions:

* Call
* WhatsApp
* Email
* Add Contact
* Schedule Visit
* Create Opportunity / Quotation where permitted

Overview

* Contact Information
* Business Information
* Relationship Summary
* Outstanding Summary where permitted
* Last Order
* Next Follow-up

Contacts

People associated with the account.

Activity

Unified timeline.

Sales

Summaries/links to:

* Opportunities
* Quotations
* Orders

Finance

Authorized summaries/links to:

* Invoices
* Outstanding
* Payments

Documents

Relevant files.

The CRM should consume summaries from other modules rather than duplicate their business logic.

⸻

96. CRM Design Requirements

Before designing CRM screens in Figma, Claude must:

1. Read PROJECT.md.
2. Read CRM.md.
3. Review approved design-system documentation.
4. Understand the workflow being designed.
5. Identify desktop and responsive behavior.
6. Identify permissions.
7. Identify states and edge cases.
8. Identify shared components.
9. Avoid inventing functionality outside approved scope.

⸻

97. CRM Development Requirements

Before implementing a CRM capability, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read CRM.md.
5. Inspect existing implementation.
6. Identify required data model.
7. Identify permissions.
8. Identify API requirements.
9. Identify integration dependencies.
10. Identify tests.
11. Implement only the approved scope.
12. Verify before reporting completion.

⸻

98. Cross-Module Boundaries

CRM owns:

* Leads
* Accounts
* Contacts
* Relationship Ownership
* CRM Activities
* Follow-ups
* Visits
* CRM Timeline

Sales owns:

* Opportunities where separately defined
* Quotations
* Sales Orders
* Pricing workflow
* Sales conversion

Billing owns:

* Invoices
* Receipts
* Payment records
* Financial outstanding

Inventory owns:

* Stock
* Warehouses
* Stock movement

Support owns:

* Tickets
* Warranty cases
* Service requests

CRM may display relevant summaries from these modules.

Do not duplicate ownership of the same business data across modules.

⸻

99. Important Product Rule

For every active lead, the CRM should strive to make these three things obvious:

Who owns it?
What happened last?
What happens next?

If the CRM cannot answer these quickly, the lead-management experience is incomplete.

⸻

100. Final CRM Principle

The CRM should make disciplined sales execution easier than ignoring the CRM.

Users should not need to update CRM after doing their work.

Where practical, doing the work through CRM should naturally create the required history.

The desired experience is:

Find
↓
Understand
↓
Act
↓
Record Outcome
↓
Schedule Next Action

The CRM succeeds when salespeople use it because it helps them sell and follow up effectively—not merely because management requires them to use it.