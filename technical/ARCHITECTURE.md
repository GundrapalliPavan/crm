ARCHITECTURE.md

Electrical Distribution CRM — Technical Architecture

Version: 1.0
Status: Technical Architecture Specification
Category: Technical
Parent Document: PROJECT.md
Related Documents: PROJECT_SETUP.md, CLAUDE.md, CRM.md, SALES.md, INVENTORY.md, PURCHASE.md, BILLING.md, REPORTS.md, DATABASE.md, API.md

⸻

1. Purpose

This document defines the technical architecture for the Electrical Distribution CRM.

The architecture must support:

* Web Application
* Future Mobile Application
* CRM
* Lead Management
* Contact & Company Management
* Sales Team Management
* Quotations
* Sales Orders
* Inventory
* Purchase Orders
* Billing
* Payments
* Reports
* WhatsApp
* Email
* SMS
* File Attachments
* Notifications
* Role-based Access
* Auditability

The architecture should prioritize:

Maintainability
+
Reliability
+
Security
+
Developer Productivity
+
Mobile Readiness
+
Reasonable Infrastructure Cost

The project should avoid unnecessary architectural complexity.

⸻

2. Architecture Principles

The system should follow these principles:

1. API-first
2. Modular architecture
3. Clear separation of concerns
4. Shared backend for web and future mobile
5. Server-side authorization
6. Centralized business logic
7. Relational data integrity
8. Asynchronous processing for external communication
9. Provider abstraction for third-party integrations
10. Auditability for important business operations
11. Financial and inventory correctness over perceived speed
12. Infrastructure simplicity
13. Horizontal scalability where practical
14. Observability from the beginning
15. No premature microservices

⸻

3. High-Level Architecture

The application should broadly follow:

                    USERS
                      │
          ┌───────────┴───────────┐
          │                       │
      Web Application        Future Mobile App
          │                       │
          └───────────┬───────────┘
                      │
                  HTTPS / API
                      │
                      ▼
               Backend Application
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    Business       Database      Background
     Modules                       Jobs
        │                           │
        └─────────────┬─────────────┘
                      │
               Integration Layer
                      │
        ┌─────────────┼──────────────┐
        │             │              │
    WhatsApp        Email           SMS
        │
        └──── Other Future Providers

The web and mobile applications should never implement critical business logic independently.

⸻

4. Recommended Architecture Style

Use a:

Modular Monolith

The backend is deployed as one primary application but internally separated into business modules.

Example:

Backend
│
├── Auth
├── Users
├── Teams
├── CRM
├── Contacts
├── Companies
├── Sales
├── Products
├── Inventory
├── Purchase
├── Billing
├── Payments
├── Communications
├── Notifications
├── Reports
├── Files
├── Audit
└── Integrations

Each module should have clearly defined responsibilities.

⸻

5. Why Modular Monolith

The application has significant cross-module workflows.

Example:

Lead
↓
Customer
↓
Quotation
↓
Sales Order
↓
Inventory
↓
Invoice
↓
Payment

Another workflow:

Supplier
↓
Purchase Order
↓
Goods Receipt
↓
Inventory
↓
Supplier Billing / Records

These workflows benefit from:

* Shared transactions
* Shared database
* Straightforward debugging
* Simpler deployment
* Lower infrastructure overhead
* Easier development

Microservices would introduce unnecessary complexity at the initial stage.

⸻

6. Microservices Rule

Do NOT initially create separate services for:

CRM Service
Inventory Service
Billing Service
Purchase Service
Sales Service

as independently deployed applications.

Keep logical boundaries without introducing network boundaries.

⸻

7. Future Service Extraction

Modules should nevertheless be designed so selected capabilities can be extracted later.

Likely candidates:

* Communication Delivery
* File Processing
* Notifications
* Reporting / Analytics
* Search
* Large Import / Export Processing

Service extraction should happen only when justified by:

* Scale
* Performance
* Reliability
* Deployment Independence
* Team Structure

⸻

8. Client Architecture

There are conceptually two clients:

Web CRM

and later:

Mobile CRM

Both must use the same backend APIs.

The mobile application should NOT require recreating the core backend.

⸻

9. Web Application

The web application is the primary initial client.

It should handle:

* Presentation
* Navigation
* Form Interaction
* Client-side Validation
* API Communication
* UI State
* Local Interaction State
* Permission-aware UX

It should NOT be responsible for authoritative:

* Pricing Logic
* Tax Calculation
* Inventory Mutation
* Invoice Calculation
* Permission Enforcement
* Payment State
* Workflow Validation

These belong to the backend.

⸻

10. Future Mobile Application

The mobile app should consume the same application APIs.

Likely high-priority mobile workflows:

* View Leads
* Add Lead
* Assign / Update Lead
* Call Customer
* WhatsApp Customer
* Email Customer
* Add Notes
* Schedule Follow-up
* Update Lead Status
* View Customer
* View Orders
* View Outstanding Payments
* Receive Notifications

Administrative functionality does not necessarily need full mobile parity.

⸻

11. Shared API Principle

Architecture:

Web ──────┐
          │
          ▼
       REST API
          ▲
          │
Mobile ───┘

Do not create:

Web Backend
+
Mobile Backend

unless future requirements justify a dedicated Backend-for-Frontend layer.

⸻

12. Backend Responsibilities

The backend is responsible for:

* Authentication
* Authorization
* Business Rules
* Validation
* Data Persistence
* Transactions
* Workflow State
* Inventory Integrity
* Financial Calculations
* Communication Orchestration
* Notifications
* Audit Logging
* File Metadata
* Reports
* Integration Security

⸻

13. Domain Modules

Recommended domain boundaries:

Authentication
Users & Teams
CRM
Contacts & Companies
Sales
Products
Inventory
Purchase
Billing
Payments
Communication
Notifications
Reports
Files
Audit
Integrations

These boundaries should be reflected in both code organization and API design.

⸻

14. Authentication Module

Responsibilities:

* Login
* Logout
* Session / Token Management
* Password Reset
* Authentication Validation
* Refresh Mechanism where applicable
* Device / Session Security where implemented

Authentication identifies the user.

Authorization determines what the user can do.

Do not mix these responsibilities.

⸻

15. Users & Teams Module

Responsibilities:

* Users
* Sales Team Members
* Roles
* Permissions
* Team Assignment
* User Status
* User Preferences where required

This module should support future sales-team tracking requirements.

⸻

16. CRM Module

Responsibilities:

* Leads
* Lead Status
* Lead Source
* Lead Ownership
* Lead Assignment
* Follow-ups
* Notes
* Activities
* Pipeline
* Opportunity Information where defined
* Lead Conversion

Detailed business rules come from CRM.md.

⸻

17. Contacts & Companies

Responsibilities:

* Contacts
* Customers
* Dealers
* Companies / Organizations
* Addresses
* Contact Methods
* Relationship Information

Avoid duplicating customer information across Sales, Billing, and CRM.

Use shared customer/contact entities.

⸻

18. Sales Module

Responsibilities:

* Quotations
* Quotation Items
* Sales Orders
* Sales Order Items
* Pricing Context
* Discounts
* Taxes
* Sales Ownership
* Sales Status
* Order Workflow

Detailed rules come from SALES.md.

⸻

19. Product Module

Responsibilities:

* Product Master
* SKU
* Category
* Brand
* Unit
* Pricing References
* Tax Classification
* Product Status

Product data should be shared by:

* Sales
* Inventory
* Purchase
* Billing

Do not maintain separate product records per module.

⸻

20. Inventory Module

Responsibilities:

* Warehouses
* Stock
* Stock Movements
* Reservations where applicable
* Adjustments
* Goods Receipt Effects
* Sales Effects
* Stock Transfers where defined
* Reorder Information

Detailed rules come from INVENTORY.md.

⸻

21. Purchase Module

Responsibilities:

* Suppliers
* Purchase Orders
* Purchase Order Items
* PO Workflow
* Goods Receipt
* Purchase-related Inventory Updates

Detailed rules come from PURCHASE.md.

⸻

22. Billing Module

Responsibilities:

* Invoices
* Invoice Items
* Tax
* Invoice Status
* Outstanding Amount
* Payment Allocation
* Billing Documents
* Credit / Adjustment behavior where defined

Detailed rules come from BILLING.md.

⸻

23. Payments

Payments deserve a clearly separated domain responsibility even if implemented within the billing module initially.

Responsibilities:

* Payment Records
* Payment Methods
* References
* Invoice Allocation
* Payment Status
* Reconciliation Data where required

Financial state changes must be transactional.

⸻

24. Reports Module

Responsibilities:

* Dashboard Aggregations
* Sales Reports
* Lead Reports
* Team Performance
* Inventory Reports
* Purchase Reports
* Billing Reports
* Outstanding Reports

Detailed reporting requirements come from REPORTS.md.

Reports should read operational data without becoming authoritative sources of business state.

⸻

25. Communication Module

Communication should be treated as a first-class platform capability.

Supported conceptual channels:

WhatsApp
Email
SMS

The application should use one internal communication model rather than embedding provider-specific logic throughout CRM modules.

⸻

26. Communication Architecture

Recommended:

CRM / Sales / Billing
        │
        ▼
Communication Service
        │
        ├── WhatsApp Adapter
        ├── Email Adapter
        └── SMS Adapter

Business modules request communication.

The communication layer determines how the selected provider is called.

⸻

27. Provider Abstraction

Avoid code such as:

Lead Module
→ Direct WhatsApp Provider API
Billing Module
→ Direct WhatsApp Provider API
Sales Module
→ Direct WhatsApp Provider API

Prefer:

Business Module
↓
Communication Service
↓
Channel Adapter
↓
Provider

This makes future provider changes significantly easier.

⸻

28. WhatsApp Integration

Architecture must support:

* Sending Messages
* Approved Templates
* Template Variables
* Attachments where supported
* Delivery Status
* Read Status where supported
* Failure Status
* Provider Webhooks
* Communication History

Actual capabilities depend on the chosen provider and WhatsApp platform rules.

⸻

29. Email Integration

Email architecture should support:

* Transactional Messages
* Billing Messages
* Quotations
* PO-related Communication where relevant
* Attachments
* Delivery Status where provider supports it
* Failure Handling
* Templates

Provider-specific code belongs in an adapter.

⸻

30. SMS Integration

SMS architecture should support:

* Transactional Messages
* Reminders
* Notifications
* Delivery Status where available
* Provider Error Handling

Do not embed SMS provider code directly into business modules.

⸻

31. Integration Interface

Conceptually:

sendMessage()
sendTemplate()
getStatus()
processWebhook()

Exact interfaces should be defined during implementation.

Provider responses should be normalized into internal application states.

⸻

32. Communication Entity

A communication record should conceptually track:

ID
Channel
Direction
Sender
Recipient
Related Entity Type
Related Entity ID
Template
Message
Status
Provider
Provider Message ID
Sent At
Delivered At
Read At
Failed At
Failure Reason
Created By
Created At

Exact schema belongs to DATABASE.md.

⸻

33. Asynchronous Communication

External messages should generally be processed asynchronously.

Recommended:

User clicks Send
      ↓
Backend validates request
      ↓
Communication record created
      ↓
Job queued
      ↓
Worker sends message
      ↓
Provider responds
      ↓
Status updated

This avoids making users wait on third-party APIs.

⸻

34. Background Job Architecture

Use background jobs for operations such as:

* WhatsApp Delivery
* Email Delivery
* SMS Delivery
* PDF Generation
* Large Imports
* Large Exports
* Report Generation
* Notification Processing
* Retryable External Calls

Do not perform every operation inside the HTTP request lifecycle.

⸻

35. Queue

Introduce a queue when asynchronous workflows are implemented.

Conceptually:

Application
    │
    ▼
 Job Queue
    │
    ▼
 Worker
    │
    ▼
External Provider

The exact queue technology should follow the stack defined in PROJECT_SETUP.md.

⸻

36. Job Requirements

Jobs should support where applicable:

* Retry
* Failure Tracking
* Idempotency
* Exponential Backoff
* Logging
* Dead-letter / Failed Job Handling

Do not retry permanently invalid requests indefinitely.

⸻

37. Idempotency

Important operations should protect against accidental duplication.

Examples:

* Sending Messages
* Recording Payments
* Creating Invoices
* Processing Webhooks
* Inventory Movements

Where appropriate, use idempotency keys or unique processing identifiers.

⸻

38. Webhook Architecture

Third-party integrations may send webhooks.

Recommended:

Provider
   ↓
Webhook Endpoint
   ↓
Verify Authenticity
   ↓
Store / Identify Event
   ↓
Process Idempotently
   ↓
Update Internal State

Never trust webhook payloads without provider-specific verification where supported.

⸻

39. Webhook Events

Possible events:

WhatsApp Message Sent
WhatsApp Delivered
WhatsApp Read
WhatsApp Failed
Email Delivered
Email Bounced
SMS Delivered
SMS Failed
Future Payment Events

The architecture should support new webhook event types without changing unrelated modules.

⸻

40. Database Architecture

Use a relational database as the authoritative transactional data store.

Recommended:

PostgreSQL

Reasons:

* Strong relational integrity
* Transactions
* Mature indexing
* Reporting capability
* JSON support where genuinely needed
* Excellent ecosystem
* Reliable financial/operational workloads

Detailed schema belongs in DATABASE.md.

⸻

41. Database Ownership

The backend owns database access.

Architecture should be:

Web / Mobile
      ↓
     API
      ↓
Backend
      ↓
Database

Do not expose direct unrestricted database access to clients.

⸻

42. Relational Integrity

Use database constraints for critical relationships.

Examples:

* Foreign Keys
* Unique Constraints
* Not-null Constraints
* Appropriate Check Constraints

Do not rely exclusively on frontend validation.

⸻

43. Transactions

Use database transactions for operations that must succeed or fail together.

Examples:

Create Invoice
+
Create Invoice Items
+
Calculate Totals

and:

Record Payment
+
Allocate Payment
+
Update Invoice State

and:

Receive PO
+
Create Stock Movements
+
Update Receipt State

Partial financial/inventory writes are unacceptable.

⸻

44. Inventory Ledger Principle

Inventory should be based on traceable stock movements.

Conceptually:

Opening Stock
Purchase Receipt
Sales Issue
Adjustment
Transfer
Return

should create inventory movement records.

Do not only overwrite a single quantity without preserving transaction history.

⸻

45. Financial Integrity

Financial values should not use floating-point arithmetic.

Use:

DECIMAL / NUMERIC

database types.

The application must correctly handle:

* Currency
* Discounts
* Tax
* Subtotals
* Totals
* Payments
* Outstanding Amounts

Initial currency/locale presentation should follow:

Locale: en-IN

and configured business currency.

⸻

46. Monetary Calculation

Authoritative financial calculations belong on the backend.

Frontend may calculate estimates for immediate UX feedback, but the backend must recalculate and validate before persistence.

Architecture:

Frontend Estimate
        ↓
Submit
        ↓
Backend Calculation
        ↓
Authoritative Result

⸻

47. Tax Architecture

Tax rules should be centralized.

Do not duplicate tax calculations across:

* Quotation
* Sales Order
* Invoice
* Purchase

Create shared domain logic where appropriate.

The implementation must support applicable Indian tax requirements defined by the project.

⸻

48. ORM / Data Access

Use the ORM/data-access approach defined by PROJECT_SETUP.md.

Data access should be centralized rather than scattered as raw SQL throughout route handlers.

Complex reports may use optimized queries where justified.

⸻

49. API Architecture

Primary API style:

REST

REST is appropriate because the application is:

* Resource-oriented
* CRUD-heavy
* Workflow-oriented
* Web + Mobile
* Integration-friendly

Detailed endpoint definitions belong in API.md.

⸻

50. API Versioning

Use versioned APIs.

Example:

/api/v1/

This provides room for future mobile compatibility and breaking API changes.

⸻

51. API Response Consistency

API responses should follow predictable structures.

Conceptually:

Success
Data
Metadata
Error

Do not let every module invent a different response convention.

⸻

52. API Error Model

Errors should be structured.

Conceptually:

Code
Message
Field Errors
Request / Correlation ID

Avoid exposing:

* Stack Traces
* SQL Errors
* Secrets
* Internal Infrastructure Details

to clients.

⸻

53. API Pagination

Large collections must support server-side pagination.

Examples:

* Leads
* Customers
* Products
* Orders
* Purchase Orders
* Invoices
* Communications

Do not load the entire database into the frontend.

⸻

54. API Filtering

Collection APIs should support relevant:

* Search
* Filtering
* Sorting
* Pagination

Filter behavior should be consistent across modules.

⸻

55. API Validation

Validate all incoming API data.

Validation should cover:

* Required Fields
* Data Types
* Lengths
* Formats
* Business Rules
* References
* Permissions

Frontend validation improves UX.

Backend validation provides correctness and security.

⸻

56. Authentication Architecture

All protected APIs require authenticated identity.

The exact authentication implementation follows PROJECT_SETUP.md.

Authentication design must support future mobile clients.

Avoid architecture that only works with a browser-specific frontend.

⸻

57. Authorization

Use role/permission-based authorization.

Conceptually:

User
↓
Role
↓
Permissions
↓
Action

Possible permissions:

lead.create
lead.read
lead.update
lead.assign
sales_order.create
sales_order.approve
inventory.read
inventory.adjust
invoice.create
invoice.issue
payment.record
report.view

Exact permissions should be defined during RBAC implementation.

⸻

58. Authorization Rule

Authorization must be checked on the backend.

Frontend permission handling exists only to improve UX.

Never assume:

Button hidden
=
Action secured

⸻

59. Resource-Level Authorization

Some permissions may depend on record ownership.

Example:

Salesperson
→ View Own Leads
Manager
→ View Team Leads
Admin
→ View All Leads

Architecture should support both:

* Capability Permission
* Data Scope

⸻

60. Audit Logging

Important business changes should be auditable.

Examples:

* Lead Assignment
* Lead Status Change
* Sales Order Approval
* Price Overrides
* Inventory Adjustments
* PO Approval
* Invoice Issue
* Payment Recording
* User Permission Changes

⸻

61. Audit Record

Conceptually track:

Actor
Action
Entity Type
Entity ID
Before / After where appropriate
Timestamp
Request Context

Do not use application logs as a replacement for business audit history.

⸻

62. File Architecture

Files may include:

* Customer Documents
* Product Documents
* PO Attachments
* Invoice PDFs
* Payment Proof
* Communication Attachments

Files should be stored in object storage rather than directly inside the relational database.

⸻

63. File Storage

Architecture:

Application
     │
     ▼
File Service
     │
     ▼
Object Storage

Database stores metadata and references.

Object storage stores binary content.

⸻

64. File Metadata

Conceptually:

ID
Storage Key
Original Name
MIME Type
Size
Related Entity
Uploaded By
Created At

Exact schema belongs to DATABASE.md.

⸻

65. File Security

Files must not automatically become public.

Use controlled access such as:

* Authorized Backend Download
* Time-limited Signed URLs

depending on infrastructure.

⸻

66. Upload Validation

Validate:

* File Size
* Allowed MIME Types
* Extension where relevant
* Authorization

Future security hardening may include malware scanning depending on deployment requirements.

⸻

67. PDF Generation

PDF generation may be required for:

* Quotations
* Sales Orders
* Purchase Orders
* Invoices
* Reports

PDF generation should occur on the backend or controlled document-generation worker.

Do not rely on browser screenshots for authoritative business documents.

⸻

68. Document Snapshots

Issued financial/business documents should preserve historical commercial data.

For example, an invoice should not change merely because the customer’s current address or product price changes later.

Documents may need snapshots of:

* Customer Name
* Billing Address
* GST Information
* Product Description
* SKU
* Price
* Tax
* Discount

Detailed schema decisions belong in DATABASE.md.

⸻

69. Search Architecture

Initial search can use PostgreSQL capabilities.

Support search across relevant fields such as:

* Lead Name
* Customer
* Phone
* Email
* Product
* SKU
* Invoice Number
* PO Number
* Sales Order Number

Do not introduce Elasticsearch/OpenSearch at the beginning unless requirements justify it.

⸻

70. Future Search Scaling

If search complexity grows significantly, architecture may later introduce a dedicated search engine.

Potential triggers:

* Millions of records
* Advanced fuzzy search
* Cross-entity ranking
* Complex full-text search
* Search analytics

Do not pay this complexity cost prematurely.

⸻

71. Caching

Do not cache everything by default.

Potential cache candidates:

* Frequently used configuration
* Permission structures
* Expensive report results
* Reference data

Do not casually cache highly dynamic values such as inventory availability without a clear invalidation strategy.

⸻

72. Cache Rule

Correct stale-data behavior must be understood before caching.

For operational software:

Correct Data
>
Faster Wrong Data

⸻

73. Reports Architecture

Initial reports should primarily query PostgreSQL.

Use:

* Indexed Queries
* Aggregations
* Database Views where helpful
* Materialized Views only when justified

Avoid introducing a separate analytics warehouse initially.

⸻

74. Heavy Reports

Expensive reports should be processed asynchronously if they cannot respond quickly.

Example:

Request Report
↓
Background Job
↓
Generate
↓
Store Result
↓
Notify User
↓
Download

⸻

75. Dashboard Architecture

Dashboard metrics should be designed around efficient aggregated queries.

Do not execute dozens of uncontrolled queries every time the dashboard opens.

Use:

* Purpose-built queries
* Aggregation
* Appropriate indexes
* Caching only where justified

⸻

76. Notifications

Internal notifications should be separated from external communications.

Internal notification:

Lead assigned to you

External communication:

WhatsApp message sent to customer

These are different concepts even if both involve messaging.

⸻

77. Notification Architecture

Conceptually:

Domain Event
     ↓
Notification Service
     ↓
In-App Notification
     ↓
Optional External Notification

Not every domain event should create a notification.

⸻

78. Domain Events

Modules may emit internal domain events.

Examples:

LeadAssigned
LeadConverted
SalesOrderConfirmed
PurchaseOrderApproved
GoodsReceived
InvoiceIssued
PaymentRecorded

These events can trigger:

* Notifications
* Audit
* Communication
* Background Work

⸻

79. Event Architecture Rule

Use events where they reduce coupling.

Do not turn every simple function call into an event.

The architecture remains a modular monolith.

⸻

80. Example Lead Assignment

User Assigns Lead
       ↓
CRM Module validates
       ↓
Lead updated
       ↓
Audit entry
       ↓
LeadAssigned event
       ↓
Notification created

Potential external notification can be handled separately.

⸻

81. Example Invoice Sending

User clicks Send Invoice
       ↓
Billing validates invoice
       ↓
PDF available/generated
       ↓
Communication request created
       ↓
Job queued
       ↓
Email / WhatsApp adapter
       ↓
Provider
       ↓
Webhook/status update
       ↓
Communication history updated

⸻

82. Example PO Receipt

User records goods receipt
       ↓
Purchase validates PO
       ↓
Database Transaction
       │
       ├── Receipt created
       ├── Receipt items created
       ├── Stock movements created
       └── PO receipt state updated
       ↓
Commit
       ↓
Audit

All inventory-changing writes must succeed together.

⸻

83. Example Payment

User records payment
       ↓
Billing/Payment validation
       ↓
Database Transaction
       │
       ├── Payment created
       ├── Allocation created
       └── Invoice state recalculated
       ↓
Commit
       ↓
Audit
       ↓
Optional receipt / notification

Do not update invoice status independently from payment allocation logic.

⸻

84. Concurrency

Architecture must account for multiple users operating simultaneously.

Important areas:

* Inventory
* Payments
* Document Numbers
* Lead Assignment
* Approval Workflows

Use database-level transactional protection where needed.

⸻

85. Inventory Concurrency

Two sales users may attempt to allocate the same stock.

Do not rely on frontend inventory values as authoritative.

Inventory availability must be revalidated during backend transaction processing.

⸻

86. Document Number Generation

Numbers such as:

Quotation Number
Sales Order Number
PO Number
Invoice Number

must be generated safely under concurrency.

Do not use:

SELECT count(*) + 1

as document numbering logic.

Use appropriate database-backed sequences/counters with business formatting.

⸻

87. Time Handling

Store timestamps consistently.

Recommended:

UTC

for backend/database timestamps.

Convert to the user’s/business timezone for display.

Do not store ambiguous local timestamps without timezone context.

⸻

88. Business Dates

Some business fields are dates rather than timestamps.

Examples:

* Invoice Date
* PO Date
* Due Date
* Delivery Date

Store them as date values when time-of-day is irrelevant.

⸻

89. Soft Delete / Archive

Important business records should usually be archived rather than permanently deleted.

Examples:

* Customers
* Products
* Leads where history matters

Financial and inventory records may require stricter retention.

Exact behavior belongs in module/database rules.

⸻

90. Data Retention

Architecture should allow future retention policies for:

* Communications
* Audit Logs
* Attachments
* Operational Records

Do not automatically delete historical business data without defined policy.

⸻

91. Configuration

Environment-specific configuration should remain outside source code.

Examples:

Database URL
JWT/Auth Secrets
Email Credentials
WhatsApp Credentials
SMS Credentials
Storage Credentials
Encryption Keys

Use environment variables or a secret-management service.

⸻

92. Secrets

Never:

* Commit Secrets
* Put Secrets in Frontend Bundles
* Store Provider Secrets in Git
* Log Secret Values

Third-party provider credentials must remain server-side.

⸻

93. Environment Strategy

Maintain separate environments:

Local
Development / Shared Dev where needed
Staging
Production

Production data should not casually be copied into development.

⸻

94. Environment Isolation

Each environment should have its own:

* Database
* Storage
* API Configuration
* Integration Credentials where practical

Test integrations should use sandbox/test environments when providers support them.

⸻

95. Logging

Use structured application logs.

Include useful context such as:

Timestamp
Level
Request ID
User ID where appropriate
Module
Action
Error Context

Never log:

* Passwords
* Access Tokens
* Full Secrets
* Sensitive Authentication Material

⸻

96. Request Correlation

Assign a request/correlation ID to API requests.

This should flow through relevant logs and background processing where practical.

It makes production debugging significantly easier.

⸻

97. Error Monitoring

Production should include centralized error monitoring.

Capture:

* Unhandled Exceptions
* API Errors
* Background Job Failures
* Integration Failures

Do not rely solely on manually reading server logs.

⸻

98. Health Checks

Backend should expose infrastructure-safe health checks.

Examples:

Application Health
Database Connectivity
Queue/Worker Health where applicable

Do not expose sensitive system details publicly.

⸻

99. Metrics

Useful operational metrics may include:

* API Latency
* Error Rate
* Job Queue Depth
* Job Failure Rate
* Database Connections
* Slow Queries
* Integration Failure Rate

Business metrics belong to reports, not infrastructure monitoring.

⸻

100. Security Architecture

Security must be layered.

Include:

* HTTPS
* Authentication
* Authorization
* Input Validation
* Secure Headers
* Rate Limiting where appropriate
* Secret Management
* Secure File Access
* Webhook Verification
* Audit Logging
* Database Protection

⸻

101. HTTPS

All production communication must use HTTPS.

Do not transmit:

* Credentials
* Tokens
* Customer Data
* Billing Data

over unencrypted HTTP.

⸻

102. CORS

CORS should explicitly allow trusted application origins.

Do not use unrestricted production CORS unless genuinely required.

⸻

103. Rate Limiting

Apply rate limiting where appropriate, especially:

* Authentication
* Password Reset
* Public Endpoints
* Webhooks where suitable
* Expensive Operations

Internal authenticated APIs may use different limits.

⸻

104. Input Security

Treat all client input as untrusted.

Protect against:

* SQL Injection
* XSS
* Malformed Input
* File Abuse
* Unauthorized References
* Mass Assignment

Use framework/ORM protections correctly.

⸻

105. Object Authorization

An authenticated user must not be able to access a record merely by changing its ID.

Every relevant request must validate:

Can this user access this specific resource?

⸻

106. Sensitive Data

Avoid returning unnecessary sensitive data through APIs.

Use response DTOs/serializers rather than blindly returning database entities.

⸻

107. Password Security

If authentication infrastructure directly stores passwords:

* Use a modern password hashing algorithm
* Never store plaintext passwords
* Never log passwords

If authentication is delegated to a managed identity provider, follow that provider’s security architecture.

⸻

108. Backups

Production database must have automated backups.

Backup strategy should include:

* Regular Backups
* Retention
* Restore Testing

A backup that has never been tested for restoration should not be assumed reliable.

⸻

109. Disaster Recovery

Document:

* Database Restore Procedure
* Storage Recovery
* Environment Reconstruction
* Secret Recovery Process
* Deployment Rollback

The level of sophistication can grow with business criticality.

⸻

110. Database Migrations

Schema changes must use migrations.

Never manually alter production database schema without a controlled migration process.

Migration files belong in source control.

⸻

111. Migration Rule

Production migrations should be:

* Reviewed
* Backward-aware where necessary
* Tested
* Recoverable where practical

Be especially careful with:

* Column Deletion
* Type Changes
* Large Table Updates
* Constraints

⸻

112. Seed Data

Seed scripts may create:

* Roles
* Permissions
* Default Settings
* Reference Data
* Development Test Data

Production seed operations must be intentional and idempotent where possible.

⸻

113. Testing Architecture

Testing should include:

Unit Tests
Integration Tests
API Tests
Critical Workflow Tests

End-to-end tests should cover important business workflows.

⸻

114. Critical Test Workflows

At minimum, eventually cover:

Login
Lead Creation
Lead Assignment
Lead Conversion
Quotation Creation
Sales Order Creation
PO Creation
Goods Receipt
Invoice Creation
Payment Recording
Inventory Movement
Communication Sending

⸻

115. Financial Tests

Financial logic requires dedicated tests for:

* Discounts
* Tax
* Rounding
* Partial Payments
* Outstanding Balances
* Invoice Totals

Do not rely only on UI tests for financial correctness.

⸻

116. Inventory Tests

Inventory tests should cover:

* Purchase Receipt
* Sales Deduction
* Adjustment
* Reservation where implemented
* Concurrent Updates
* Negative Stock Rules

⸻

117. Integration Tests

Third-party adapters should be testable without contacting live providers.

Use:

* Mock Providers
* Sandbox APIs
* Test Credentials

Do not send real customer messages during automated tests.

⸻

118. CI/CD

Code changes should pass automated checks before deployment.

Pipeline should eventually include:

Install
↓
Lint
↓
Type Check
↓
Tests
↓
Build
↓
Deploy

Database migration execution should be controlled.

⸻

119. Deployment Architecture

Keep initial deployment simple.

Conceptually:

Frontend
+
Backend
+
PostgreSQL
+
Object Storage
+
Queue/Worker when required

Do not introduce Kubernetes solely for architectural appearance.

⸻

120. Stateless Backend

Where practical, application instances should remain stateless.

Persistent data belongs in:

* PostgreSQL
* Object Storage
* Cache/Queue where applicable

This makes horizontal scaling easier.

⸻

121. Scaling Strategy

Scale in this order:

Optimize Queries
↓
Add Correct Indexes
↓
Improve Expensive Workflows
↓
Add Caching where justified
↓
Increase Resources
↓
Horizontal Scaling
↓
Extract Services only if needed

Do not jump directly to distributed architecture.

⸻

122. Database Scaling

Initial:

Single Managed PostgreSQL Primary

Later options may include:

* Larger Instance
* Connection Pooling
* Read Replicas for reporting
* Archival
* Partitioning

Only introduce when actual usage requires it.

⸻

123. Performance Targets

The application should feel responsive during daily operational use.

Typical API interactions should aim for low latency under normal load.

Performance should be measured rather than guessed.

Slow operations should use:

* Background Jobs
* Pagination
* Optimized Queries
* Appropriate Indexes

⸻

124. N+1 Query Prevention

Data-access implementation must avoid N+1 query patterns.

This is especially important for:

* Lead Lists
* Customer Lists
* Orders
* Invoice Tables
* Reports

Review query behavior rather than assuming ORM usage is automatically efficient.

⸻

125. API Payload Size

Return only required data.

Do not return:

Customer
+
Every Order
+
Every Invoice
+
Every Communication
+
Every Activity

in one massive customer-detail API response.

Use purpose-specific endpoints and pagination.

⸻

126. Import Architecture

Future CSV/Excel imports may be required for:

* Leads
* Contacts
* Products
* Customers
* Suppliers
* Opening Inventory

Large imports should use background processing.

⸻

127. Import Flow

Recommended:

Upload File
↓
Validate Structure
↓
Preview
↓
Confirm
↓
Background Import
↓
Result Summary

Do not insert thousands of records directly from an uncontrolled browser loop.

⸻

128. Import Validation

Import result should distinguish:

Successful Rows
Failed Rows
Duplicate Rows
Warnings

Users should be able to understand why rows failed.

⸻

129. Export Architecture

Exports may include:

* CSV
* Excel
* PDF

Small exports may be synchronous.

Large exports should use background jobs.

⸻

130. Multi-Tenant Readiness

Unless PROJECT.md explicitly defines this as a multi-tenant SaaS platform, do NOT prematurely implement complex multi-tenancy.

However, avoid architecture that unnecessarily makes future organizational separation impossible.

If multi-tenancy becomes a confirmed requirement, it must receive dedicated architecture and database design.

⸻

131. Single Source of Truth

Each domain concept should have an authoritative source.

Examples:

Product
→ Product Master
Customer
→ Contact/Company Domain
Stock
→ Inventory Ledger / Derived Inventory State
Invoice
→ Billing
Payment
→ Payments
Communication
→ Communication History

Avoid maintaining competing copies across modules.

⸻

132. Derived Data

Values that can be derived should not automatically become duplicated mutable state.

Examples:

Outstanding Amount
Available Stock
Sales Totals

Whether to calculate or persist them depends on performance and integrity requirements.

If persisted, update them through controlled domain logic.

⸻

133. Workflow State Machines

Complex business documents should use controlled state transitions.

Example:

Draft
↓
Confirmed
↓
Completed

rather than allowing arbitrary status strings.

Exact transitions belong in module documents.

⸻

134. Status Rule

Do not implement:

status = arbitrary string

for important workflows.

Use controlled enumerations/state logic where appropriate.

⸻

135. Approval Architecture

If approvals are required:

Action Requested
↓
Permission Check
↓
Approval State
↓
Approver Action
↓
Audit
↓
Domain Transition

Do not implement approval as merely changing a label in the UI.

⸻

136. Scheduled Jobs

Scheduled background tasks may eventually handle:

* Follow-up Reminders
* Overdue Invoice Detection
* Daily Summaries
* Notification Processing
* Cleanup
* Integration Synchronization

Scheduled jobs should be idempotent where practical.

⸻

137. Overdue Invoice Logic

Do not require manually changing every invoice to:

Overdue

A scheduled process or derived status can determine overdue state based on:

Due Date
+
Outstanding Balance

Exact implementation belongs to Billing architecture.

⸻

138. Reminder Architecture

Example:

Follow-up Date Reached
↓
Scheduled Worker
↓
Notification
↓
Assigned Salesperson

Future mobile push notifications can subscribe to the same internal notification model.

⸻

139. Mobile Push Readiness

Future architecture may add:

Notification Service
↓
Push Provider
↓
Mobile Device

Do not implement push infrastructure before the mobile application requires it.

But notification data should not be web-only.

⸻

140. API Compatibility with Mobile

Avoid APIs that depend on:

* Browser DOM
* Browser Cookies only, if the chosen auth strategy cannot support mobile
* Frontend-specific route state
* Desktop-only assumptions

The backend should expose business resources independently of presentation.

⸻

141. Version Compatibility

Once a mobile application is released, older mobile versions may continue calling APIs.

API changes must therefore become more disciplined.

This is another reason to begin with:

/api/v1

⸻

142. External Integration Failure

Third-party provider failure must not corrupt internal business data.

Example:

Invoice Created Successfully
↓
Email Provider Fails

Result:

Invoice remains valid
Communication marked Failed
Retry available

Do not roll back valid invoice creation because an external email provider is temporarily unavailable.

⸻

143. Circuit Breaking / Provider Protection

Advanced provider protection may be introduced if integrations become high-volume.

Potential future capabilities:

* Circuit Breaker
* Provider Rate Control
* Bulkhead Isolation
* Fallback Provider

Do not implement these prematurely.

⸻

144. Integration Rate Limits

Provider rate limits must be respected.

Background jobs should make it possible to:

* Throttle
* Retry
* Queue

communication rather than flooding providers.

⸻

145. Template Architecture

Communication templates should be stored independently of provider-specific code where practical.

Conceptually:

Template
Channel
Purpose
Content
Variables
Provider Template ID where required
Status

This allows business workflows to reference templates without knowing provider implementation details.

⸻

146. Template Variables

Use controlled variables.

Example:

{{customer_name}}
{{invoice_number}}
{{invoice_total}}
{{due_date}}

Validate required variables before sending.

Do not use uncontrolled code execution for template interpolation.

⸻

147. Communication Consent

Architecture should allow storing communication preferences/consent where legally or operationally required.

Do not assume every contact can automatically receive every communication type.

Exact compliance requirements should be defined before implementation.

⸻

148. Data Ownership

Business data belongs to the application’s domain model, not external providers.

Example:

WhatsApp provider may store message information, but the CRM should retain the communication records needed for its own business history.

⸻

149. Integration Replacement

The architecture should make this possible:

Provider A
↓
Provider Adapter
↓
Internal Communication Interface

later becoming:

Provider B
↓
Provider Adapter
↓
Same Internal Interface

without rewriting CRM, Billing, and Sales.

⸻

150. Development Dependency Direction

Preferred dependency direction:

API / Controllers
        ↓
Application Services
        ↓
Domain Logic
        ↓
Repositories / Infrastructure

Avoid putting significant business logic directly inside route/controller handlers.

⸻

151. Controller Responsibility

Controllers/routes should primarily:

Receive Request
↓
Validate / Parse
↓
Call Application Service
↓
Return Response

They should not contain hundreds of lines of domain logic.

⸻

152. Service Responsibility

Application/domain services coordinate:

* Business Rules
* Permissions
* Transactions
* Repository Operations
* Domain Events
* Integration Requests

Keep responsibilities clear.

⸻

153. Repository / Data Access

Repositories/data-access layers should handle persistence concerns.

Avoid leaking ORM-specific implementation details throughout the entire application where abstraction provides value.

Do not over-abstract simple queries without benefit.

⸻

154. Shared Utilities

Shared code may include:

* Money Handling
* Date Handling
* Pagination
* Error Handling
* Validation
* Logging
* IDs
* File Helpers

Do not create a generic utils dumping ground.

Organize utilities by responsibility.

⸻

155. Shared Domain Logic

Cross-module business logic should be centralized where appropriate.

Examples:

Money
Tax
Document Numbering
Permissions
Audit

Do not duplicate these implementations across modules.

⸻

156. IDs

Use stable unique identifiers.

The exact identifier type will be finalized in DATABASE.md.

Do not expose sequential database IDs where doing so creates avoidable security or future migration concerns.

⸻

157. Human-readable Numbers

Business documents require separate human-readable numbers.

Example:

Internal ID
→ stable system identifier
Invoice Number
→ INV/HYD/2026-27/001245

Do not use invoice numbers as primary database keys.

⸻

158. Data Validation Layers

Validation occurs at multiple layers:

Frontend
→ UX Validation
API
→ Input Validation
Domain
→ Business Rule Validation
Database
→ Integrity Constraints

Each layer serves a different purpose.

⸻

159. Architecture Anti-Patterns

Do NOT:

* Start with microservices
* Create separate web/mobile backends
* Put business logic in frontend
* Put critical logic in controllers
* Access database directly from clients
* Store money as floating point
* Update stock without movement history
* Trust client-calculated totals
* Trust webhook payloads without verification
* Put provider credentials in frontend
* Call providers directly from every module
* Use synchronous HTTP requests for every external message
* Store uploaded files directly in database unless specifically justified
* Create one giant API response for detail screens
* Load complete datasets client-side
* Use arbitrary status strings
* Generate document numbers using row counts
* Ignore concurrency
* Ignore audit requirements
* Build a data warehouse before needed
* Build Elasticsearch before needed
* Add Redis merely because it is common
* Add Kubernetes merely because it is scalable
* Introduce infrastructure without a clear requirement

⸻

160. Initial Architecture

The practical initial architecture should remain approximately:

┌───────────────────────────────────────┐
│              Web Client               │
└───────────────────┬───────────────────┘
                    │
                    │ HTTPS
                    ▼
┌───────────────────────────────────────┐
│             Backend API               │
│                                       │
│ Auth                                  │
│ Users / Teams                         │
│ CRM                                   │
│ Contacts                              │
│ Sales                                 │
│ Products                              │
│ Inventory                             │
│ Purchase                              │
│ Billing                               │
│ Payments                              │
│ Reports                               │
│ Communications                        │
│ Notifications                         │
│ Files                                 │
│ Audit                                 │
└──────────┬───────────────┬────────────┘
           │               │
           ▼               ▼
     PostgreSQL       Object Storage
           │
           │ when async workloads begin
           ▼
        Job Queue
           │
           ▼
          Worker
           │
     ┌─────┼──────┐
     ▼     ▼      ▼
 WhatsApp Email   SMS

⸻

161. Future Architecture

As usage grows:

                  Web
                   │
                Mobile
                   │
                   ▼
              API Layer
                   │
         Modular Application
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
PostgreSQL       Cache         Storage
    │
    ▼
Read Replica if justified
Application
    │
    ▼
Queue
    │
    ├── Communication Workers
    ├── Report Workers
    ├── Import/Export Workers
    └── Document Workers

Only extract independently deployed services when actual scale or operational requirements justify them.

⸻

162. Architecture Evolution Principle

The architecture should evolve:

Simple
↓
Structured
↓
Measured
↓
Optimized
↓
Scaled

Not:

Simple Requirement
↓
Microservices
↓
Kubernetes
↓
Distributed Complexity

⸻

163. Claude Architecture Instruction

Before making architectural changes, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read ARCHITECTURE.md.
4. Read the relevant module document.
5. Check whether an existing architecture pattern already solves the requirement.
6. Preserve API-first architecture.
7. Preserve mobile readiness.
8. Preserve modular boundaries.
9. Keep business logic server-side.
10. Preserve relational integrity.
11. Consider transactions.
12. Consider concurrency.
13. Consider authorization.
14. Consider auditability.
15. Consider integration failure.
16. Avoid unnecessary infrastructure.
17. Avoid premature service extraction.
18. Document significant architectural decisions.

⸻

164. Claude Backend Instruction

When implementing backend functionality:

Route / Controller
↓
Application / Domain Service
↓
Repository / Data Access
↓
Database

where appropriate.

For external operations:

Domain Service
↓
Integration / Communication Service
↓
Queue where applicable
↓
Provider Adapter

Do not bypass architectural boundaries for convenience.

⸻

165. Claude Frontend Instruction

Frontend implementation must:

* Consume backend APIs
* Avoid authoritative business logic
* Respect permissions for UX
* Never treat hidden UI as security
* Handle API loading
* Handle errors
* Handle empty states
* Preserve user-entered data after recoverable failures
* Never expose secrets
* Never connect directly to production database
* Remain compatible with future API evolution

⸻

166. Architecture Decision Records

Significant architecture changes should be documented as ADRs when development becomes substantial.

Examples:

ADR-001 Authentication Strategy
ADR-002 Database Identifier Strategy
ADR-003 Job Queue Selection
ADR-004 File Storage Provider
ADR-005 WhatsApp Provider
ADR-006 Email Provider
ADR-007 Deployment Platform

This prevents important technical decisions from existing only inside conversations.

⸻

167. Architecture Decision Rule

When choosing technology, evaluate:

Does the project need it now?
Does it reduce or increase complexity?
Can the team maintain it?
What happens when it fails?
Can it be replaced?
Does it support mobile later?
What does it cost operationally?

Do not choose technology simply because it is fashionable.

⸻

168. Source of Truth Hierarchy

Technical implementation should follow:

PROJECT.md
↓
PROJECT_SETUP.md
↓
ARCHITECTURE.md
↓
DATABASE.md
↓
API.md
↓
Module Documents
↓
Implementation

Where documents conflict, Claude should identify the conflict instead of silently making assumptions.

⸻

169. Architecture Success Criteria

The architecture is successful when:

* Web development remains straightforward.
* Mobile can later use the same backend.
* Business modules remain understandable.
* CRM does not become tightly coupled to provider APIs.
* Inventory transactions remain traceable.
* Financial calculations remain reliable.
* Integrations can fail without corrupting core data.
* Permissions are enforced centrally.
* Important changes are auditable.
* Large datasets do not need to be loaded into browsers.
* Infrastructure remains manageable.
* New developers can understand module boundaries.
* Scaling does not require rewriting the entire application.

⸻

170. Final Architecture Principle

The project should begin as:

API-first
+
Modular Monolith
+
PostgreSQL
+
Object Storage
+
Background Processing where required
+
Provider Adapters

The system should be designed around this principle:

Web today
+
Mobile tomorrow
=
One business platform

Core business rules belong to the backend.

The database protects business integrity.

The API exposes business capabilities.

The web and mobile applications provide different user experiences over the same platform.

Third-party providers remain replaceable integrations rather than foundations of the business model.

The architecture should remain simple enough to develop efficiently while structured enough to support the CRM as it grows into a serious operational system for sales, inventory, purchase, billing, communication, and reporting.