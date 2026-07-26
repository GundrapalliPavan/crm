BACKEND.md

Electrical Distribution CRM — Backend Development Instructions for Claude

Version: 1.0
Status: Active Backend Instruction
Category: Prompt / Backend
Purpose: Persistent backend implementation guidance for Claude when building, modifying, reviewing, testing, or refactoring the CRM backend.

⸻

1. Role

When working on the backend for this project, act as a:

Senior Backend Engineer
+
Software Architect
+
Database Engineer
+
API Architect
+
Enterprise CRM Domain Engineer

The backend must be designed as the authoritative business layer of the application.

The objective is not simply:

Receive Request
→ Query Database
→ Return JSON

The backend must protect:

Business Rules
Data Integrity
Financial Integrity
Inventory Integrity
Security
Permissions
Auditability
Workflow Integrity
Integration Reliability

⸻

2. Project Context

This application is a CRM and business operations platform for an electrical products distributor dealing primarily with:

* Lights
* Fans
* Wires
* Switches

The application supports:

* Leads
* Contacts
* Companies / Customers
* Follow-ups
* Sales Team
* Quotations
* Sales Orders
* Products
* Inventory
* Warehouses
* Suppliers
* Purchase Orders
* Goods Receipts
* Billing
* Invoices
* Payments
* Reports
* WhatsApp
* Email
* SMS
* Notifications
* Team Management
* Roles & Permissions
* Settings

The backend must support:

Web Application
+
Future Mobile Application
+
Third-party Integrations

through stable APIs.

⸻

3. Source of Truth

Before implementing backend functionality, Claude must read:

PROJECT.md
PROJECT_SETUP.md
CLAUDE.md
ARCHITECTURE.md
DATABASE.md
API.md
BACKEND.md

Then read the relevant module document.

Examples:

CRM
→ CRM.md
Sales
→ SALES.md
Inventory
→ INVENTORY.md
Purchase
→ PURCHASE.md
Billing
→ BILLING.md
Reports
→ REPORTS.md

Do not implement functionality outside approved project scope.

⸻

4. Backend Principle

Follow:

Frontend requests an operation.
Backend decides whether that operation is valid.

The frontend must never be treated as trusted.

Every important operation must be validated independently by the backend.

⸻

5. Backend Responsibilities

The backend owns authoritative:

* Authentication
* Authorization
* Business rules
* Validation
* Workflow transitions
* Database transactions
* Financial calculations
* Tax calculations
* Inventory calculations
* Stock movements
* Document numbering
* Payment allocation
* Integration orchestration
* Background jobs
* Audit logging
* Idempotency
* Data integrity
* API contracts

⸻

6. Backend Must Not Depend on Frontend

Never assume:

The frontend hides this button

therefore:

The user cannot perform this operation.

Every API operation must independently verify:

Authentication
Permission
Input
Business State
Ownership / Scope
Data Integrity

⸻

7. Architecture

Follow ARCHITECTURE.md.

Conceptually:

Client
   │
   ▼
API / Controller
   │
   ▼
Validation
   │
   ▼
Authorization
   │
   ▼
Application / Service Layer
   │
   ▼
Domain Logic
   │
   ▼
Repository / Data Access
   │
   ▼
Database

Cross-cutting services may include:

Audit
Notifications
Communication
Jobs
Logging
Storage
Integrations

⸻

8. Layer Responsibilities

Controller / Route Layer

Responsible for:

Request parsing
Authentication context
Input validation invocation
Service invocation
Response formatting

Controllers should remain thin.

Do not place complex business logic inside route handlers.

⸻

9. Service Layer

The service layer coordinates business operations.

Examples:

LeadService
QuotationService
SalesOrderService
InventoryService
PurchaseOrderService
InvoiceService
PaymentService
CommunicationService

Services may coordinate:

Validation
Repositories
Transactions
Audit events
Notifications
Background jobs

⸻

10. Repository / Data Access Layer

Repositories handle database interaction where the selected architecture uses repositories.

Examples:

findById()
findMany()
create()
update()

Do not place business workflow decisions inside repository methods.

⸻

11. Domain Logic

Important domain rules should be explicit.

Examples:

Can this quotation be converted?
Can this sales order be confirmed?
Can this invoice be cancelled?
Can this stock movement occur?
Can this payment be allocated?

Avoid burying these rules inside unrelated database queries.

⸻

12. Database

Follow DATABASE.md.

Do not modify database structure casually.

Schema changes must be performed through migrations.

Never manually alter production database structure as part of normal application deployment.

⸻

13. Database Constraints

Use database constraints where they protect genuine integrity.

Examples:

NOT NULL
UNIQUE
FOREIGN KEY
CHECK

Application validation complements database constraints.

It does not replace them.

⸻

14. IDs

Use the ID strategy defined in DATABASE.md.

Do not expose assumptions such as:

ID = sequential business document number

Internal record IDs and business document numbers should remain separate concepts.

⸻

15. Business Document Numbers

Documents such as:

Quotation
Sales Order
Purchase Order
Invoice

must use the numbering strategy defined by their module.

Example display:

QT/HYD/2026-27/00124
SO/HYD/2026-27/00098
INV/HYD/2026-27/001245

Do not generate document numbers in the frontend.

⸻

16. Document Number Concurrency

Number generation must be concurrency-safe.

Two simultaneous requests must never generate the same document number.

Use appropriate database transaction/locking/sequence strategies.

⸻

17. Transactions

Use database transactions for operations requiring atomicity.

Example:

Create Goods Receipt
+
Create Receipt Items
+
Create Inventory Movements
+
Update PO Receipt State

must succeed or fail as one logical operation where required.

⸻

18. Transaction Principle

Ask:

If operation B fails after operation A succeeds,
would the business data become inconsistent?

If yes, they likely belong in the same transaction.

⸻

19. Keep Transactions Focused

Do not keep database transactions open while waiting for slow external services.

Bad:

BEGIN TRANSACTION
Update Invoice
Call WhatsApp Provider
Wait...
COMMIT

External communication should usually be decoupled through background processing.

⸻

20. Validation

Every endpoint must validate input.

Validate:

Types
Required values
Formats
Ranges
Enums
Relationships
Business conditions

Do not trust TypeScript types as runtime validation.

⸻

21. Validation Layers

Use:

Request Validation
+
Business Validation
+
Database Constraints

Each serves a different purpose.

⸻

22. Request Validation

Examples:

Email format
Phone format
Date format
Positive quantity
Valid enum
Required IDs

Reject malformed requests early.

⸻

23. Business Validation

Examples:

Quotation must be valid for conversion.
Invoice cannot be edited after issue where prohibited.
Payment cannot exceed permitted allocation.
Received quantity cannot violate PO rules.
Stock adjustment requires a reason.

Business validation belongs in the backend domain/service layer.

⸻

24. Validation Errors

Return structured validation errors according to API.md.

Example:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {
      "phone": [
        "Enter a valid phone number."
      ]
    }
  }
}

Do not return raw framework validation output directly.

⸻

25. Authentication

Follow authentication architecture defined in PROJECT_SETUP.md and ARCHITECTURE.md.

Authentication establishes:

Who is making the request?

Authorization establishes:

Are they allowed to perform this operation?

Never confuse the two.

⸻

26. Authorization

Every protected operation must validate permissions.

Examples:

lead.read
lead.create
lead.update
quotation.create
inventory.adjust
invoice.issue
payment.create

Exact permissions follow the approved RBAC design.

⸻

27. Permission Checks

Prefer capability checks.

Conceptually:

authorize(user, "invoice.issue")

Avoid scattering:

if user.role === "admin"

throughout business services.

Roles should map to permissions.

⸻

28. Resource Scope

Permission may not always mean access to every record.

Examples:

Sales Executive
→ Own leads
Sales Manager
→ Team leads
Administrator
→ All leads

where defined by business requirements.

Backend queries must enforce applicable scope.

⸻

29. Never Trust Client Scope

Do not trust:

assignedUserId
teamId
branchId

sent by the client to establish access.

Resolve authorized scope from authenticated context and business rules.

⸻

30. API Design

Follow API.md.

Use predictable resource-oriented APIs.

Examples:

GET /leads
GET /leads/:id
POST /leads
PATCH /leads/:id

Workflow operations may use explicit actions where appropriate.

Example:

POST /quotations/:id/convert
POST /sales-orders/:id/confirm
POST /invoices/:id/issue

⸻

31. Do Not Force CRUD for Workflows

Some business operations are not generic updates.

Bad:

PATCH /invoice/:id
{
  "status": "paid"
}

when payment should occur through:

Record Payment
↓
Allocate Payment
↓
Invoice status derived

Model business actions explicitly.

⸻

32. Status Transitions

Do not allow arbitrary status assignment.

Define valid transitions.

Conceptually:

Draft
→ Issued
→ Partially Paid
→ Paid

and appropriate cancellation paths.

Reject invalid transitions.

⸻

33. Derived Status

Where status can be reliably derived from authoritative data, prefer deriving it instead of allowing arbitrary manual changes.

Example:

Invoice payment status

may depend on:

Invoice Total
vs
Allocated Payments

Do not let clients manually mark an unpaid invoice as paid.

⸻

34. API Responses

Return predictable response structures according to API.md.

Avoid different response conventions across modules.

⸻

35. Pagination

Large collections must use server-side pagination.

Examples:

Leads
Contacts
Products
Invoices
Stock Movements
Communication Logs

Do not return unlimited collections.

⸻

36. Filtering

Filter only on supported fields.

Validate filter values.

Do not dynamically convert arbitrary query parameters into database filters.

⸻

37. Sorting

Whitelist sortable fields.

Never directly insert client-provided column names into SQL/order expressions.

⸻

38. Search

Search behavior should be explicit per resource.

Examples:

Leads:

Name
Company
Phone
Email

Products:

Product Name
SKU
Brand

Invoices:

Invoice Number
Customer

⸻

39. Avoid N+1 Queries

Review data-access patterns.

Lists containing:

Lead
Owner
Company
Next Follow-up

should not execute separate database queries for every row.

Use appropriate joins, includes, batching, or query strategies.

⸻

40. Select Only Needed Data

Do not fetch enormous relational objects when the endpoint requires only summary fields.

Design list and detail queries separately where appropriate.

⸻

41. CRM Domain

The CRM backend must support:

Leads
Contacts
Companies
Assignment
Follow-ups
Activities
Conversion

according to CRM.md.

⸻

42. Lead Ownership

Lead assignment must validate:

Target user exists
Target user is active
Target user can own leads
Current user can assign

where required.

⸻

43. Lead Assignment Audit

Assignment changes should preserve history.

Example:

Lead assigned
From:
Rahul
To:
Amit
By:
Sales Manager
At:
timestamp

Do not silently overwrite ownership without traceability where audit is required.

⸻

44. Follow-ups

Follow-ups should have explicit lifecycle rules.

Potential states:

Scheduled
Completed
Cancelled

according to CRM.md.

Completion may include:

Outcome
Notes
Next Follow-up

⸻

45. Overdue Follow-up

Do not necessarily store:

isOverdue = true

if overdue can reliably be derived from:

scheduledAt < currentTime
AND
status = scheduled

Avoid stale derived data.

⸻

46. Lead Activity

Business activity should capture meaningful events.

Examples:

Lead created
Lead assigned
Follow-up scheduled
Follow-up completed
WhatsApp sent
Quotation created
Lead converted

Do not create meaningless activity entries for every internal field update.

⸻

47. Activity vs Audit

Keep conceptual separation:

Activity
→ Human-readable business timeline
Audit Log
→ Compliance / administrative change history

They may originate from the same operation but serve different purposes.

⸻

48. Lead Conversion

Lead conversion must be transactionally safe.

Where conversion creates:

Customer
Contact
Opportunity / related records

avoid duplicate records from repeated requests.

Use idempotent conversion behavior.

⸻

49. Duplicate CRM Data

Where applicable, check potential duplicates using approved rules.

Possible signals:

Phone
Email
Company
GSTIN

Do not automatically merge records based on weak similarity.

⸻

50. Sales Domain

Follow SALES.md.

Core flow:

Lead / Customer
↓
Quotation
↓
Sales Order

Preserve relationships between source documents.

⸻

51. Quotation Creation

Quotation creation must validate:

Customer
Products
Quantities
Prices
Discounts
Tax configuration
Validity
Permissions

according to approved rules.

⸻

52. Quotation Totals

Backend calculates authoritative:

Line Amount
Discount
Taxable Amount
Tax
Subtotal
Grand Total

Do not trust totals submitted by frontend.

⸻

53. Client-side Totals

Frontend may send line input such as:

Quantity
Price
Discount
Tax selection

Backend recalculates totals.

Never accept:

grandTotal

as authoritative simply because the client calculated it.

⸻

54. Decimal Arithmetic

Never use binary floating-point arithmetic for money.

Use:

Database DECIMAL / NUMERIC
+
Decimal-safe application arithmetic

according to technology stack.

Avoid:

0.1 + 0.2

style floating-point financial logic.

⸻

55. Currency

Default currency:

INR

Store monetary values according to the strategy defined in DATABASE.md.

Do not store formatted values such as:

₹1,25,000

in numeric database columns.

Store numeric values separately from presentation formatting.

⸻

56. Tax

Tax calculations must follow approved business rules.

Do not invent GST logic.

Where GST is included in project requirements, account for applicable concepts such as:

CGST
SGST
IGST

only according to approved configuration and requirements.

Tax decisions belong to backend logic.

⸻

57. Tax Snapshots

Commercial documents should preserve the tax data applicable when they were created/issued where required.

Do not rely solely on current product tax configuration when reading historical invoices.

⸻

58. Product Price Snapshots

Commercial document lines should preserve their transaction price.

If product master price later changes:

Historical quotation/invoice

must not silently change.

⸻

59. Quotation Conversion

Conversion:

Quotation
→ Sales Order

must preserve traceability.

Store the source quotation reference.

Do not duplicate conversion on repeated requests.

⸻

60. Sales Order

Sales order logic must validate:

Customer
Products
Quantities
Pricing
Status
Permissions
Relevant stock rules

according to SALES.md.

⸻

61. Sales Order Confirmation

Confirmation should be an explicit domain operation.

Example:

confirmSalesOrder()

not:

updateStatus("confirmed")

when confirmation triggers business rules.

⸻

62. Inventory Domain

Follow INVENTORY.md.

Inventory is a high-integrity subsystem.

Never treat stock as a simple editable field.

⸻

63. Inventory Ledger Principle

Prefer inventory movement/ledger architecture.

Stock changes occur through movements.

Examples:

Purchase Receipt
Sales Issue
Adjustment
Transfer
Return

Current stock is derived or maintained consistently from those movements according to DATABASE.md.

⸻

64. Never Directly Edit Stock

Do not expose generic:

UPDATE inventory
SET quantity = ...

operations for business workflows.

Use explicit stock operations.

⸻

65. Stock Movement

Every stock movement should capture relevant:

Product
Warehouse
Quantity
Direction / Type
Reference
Reason
Timestamp
User / System Actor

according to database design.

⸻

66. Positive / Negative Direction

Make movement direction unambiguous.

Example concept:

Purchase Receipt
+50
Sales Issue
-10

Do not create inconsistent sign conventions across modules.

⸻

67. Inventory Transactions

Stock-changing operations must be transactional.

Example:

Goods Receipt
↓
Receipt Lines
↓
Inventory Movement
↓
PO Received Quantity

must not leave partial inconsistent state.

⸻

68. Concurrency

Inventory operations must consider concurrent requests.

Example:

Available stock: 10
Request A wants 8
Request B wants 7

Both requests must not succeed if business rules prohibit negative availability.

Use appropriate:

Transactions
Locks
Atomic updates
Isolation

according to database architecture.

⸻

69. Stock Availability

Never trust frontend stock availability.

Revalidate stock at the point of authoritative operation.

⸻

70. Reserved Stock

If reservations are supported, distinguish:

On Hand
Reserved
Available

according to INVENTORY.md.

Do not invent reservation behavior if it is not part of approved scope.

⸻

71. Inventory Adjustments

Adjustments require:

Product
Warehouse
Adjustment quantity
Reason
Actor

and any additional approved information.

Audit the operation.

⸻

72. Purchase Domain

Follow PURCHASE.md.

Core flow:

Supplier
↓
Purchase Order
↓
Goods Receipt
↓
Inventory

⸻

73. Purchase Order

Validate:

Supplier
Products
Quantities
Purchase Prices
Tax
Expected Delivery
Permissions

according to approved rules.

⸻

74. PO Status

Do not allow arbitrary PO status updates.

Status should reflect valid workflow operations.

Potential conceptual flow:

Draft
→ Approved / Confirmed
→ Partially Received
→ Received

Exact states follow PURCHASE.md.

⸻

75. Goods Receipt

Goods receipt must reference:

Purchase Order
Supplier
Warehouse
Received Products
Received Quantities

where required.

⸻

76. Partial Receipt

Support partial receipts where defined.

Track:

Ordered
Previously Received
Receiving Now
Remaining

Do not overwrite ordered quantities.

⸻

77. Over Receipt

Whether receiving more than ordered is allowed must be explicitly defined.

Do not assume.

If not permitted:

receivingNow
<=
remainingQuantity

must be enforced server-side.

⸻

78. Duplicate Receipt Protection

Repeated requests must not duplicate stock.

Goods receipt creation is a high-priority idempotency case.

⸻

79. Billing Domain

Follow BILLING.md.

Core flow:

Sales Order
↓
Invoice
↓
Payment
↓
Allocation

Billing requires strong financial integrity.

⸻

80. Invoice Creation

Where created from a sales order, invoice creation should copy required transaction data.

Do not rely on live product/customer values for historical financial documents where snapshots are required.

⸻

81. Invoice Snapshot

An issued invoice may need to preserve:

Customer Name
Billing Address
GSTIN
Product Description
Quantity
Price
Discount
Tax
Totals
Terms

according to BILLING.md and DATABASE.md.

Future customer/product edits must not corrupt historical invoice content.

⸻

82. Invoice Issue

Issuing an invoice should be an explicit operation.

Conceptually:

issueInvoice()

The operation may:

Validate invoice
Assign final number
Lock relevant financial data
Set issued timestamp
Create audit event

according to billing rules.

⸻

83. Invoice Editing

Draft invoices may be editable.

Issued invoices must follow the restrictions in BILLING.md.

Do not allow arbitrary editing of issued financial documents.

⸻

84. Invoice Status

Invoice status must reflect authoritative business state.

Potential:

Draft
Issued
Partially Paid
Paid
Overdue
Cancelled

Exact states follow BILLING.md.

⸻

85. Payment Recording

Payment creation must validate:

Customer
Amount
Date
Payment method
Reference
Permissions

and any required accounting information.

⸻

86. Payment Amount

Payment amount must be:

> 0

unless an explicit adjustment/refund workflow exists.

Do not use negative payments as an undocumented workaround.

⸻

87. Payment Allocation

Payment allocation must be transactional.

Example:

Payment
₹1,00,000
Invoice A
₹60,000
Invoice B
₹40,000

Backend must verify:

Sum of allocations
<=
Available payment amount

and:

Allocation to invoice
<=
Permitted outstanding amount

according to billing rules.

⸻

88. Invoice Payment Status

After allocation, derive/update invoice state safely.

Example:

Outstanding = 0
→ Paid
0 < Outstanding < Invoice Total
→ Partially Paid

Do not trust a client-supplied invoice payment status.

⸻

89. Payment Concurrency

Concurrent allocations must not over-allocate the same payment or invoice.

Use appropriate transaction and locking strategy.

⸻

90. Financial Auditability

Financial operations should preserve:

Who
What
When
Amount
Reference
Related document

where required.

Do not silently overwrite historical financial events.

⸻

91. Reports

Follow REPORTS.md.

Reports should be calculated server-side where they represent business metrics.

Do not require frontend clients to fetch all raw records to calculate reports.

⸻

92. Report Services

Separate complex reporting queries from transactional CRUD where appropriate.

Example:

SalesReportService
LeadReportService
InventoryReportService
BillingReportService

Do not over-engineer if simple queries are sufficient.

⸻

93. Report Filters

Validate:

Date range
Team
User
Status
Product
Category
Warehouse

according to each report.

⸻

94. Large Reports

Large reports should support:

Pagination
Streaming
Background generation
Export jobs

depending on size and requirement.

Do not load millions of records into application memory.

⸻

95. Exports

For large exports:

Request Export
↓
Queue Job
↓
Generate File
↓
Store Securely
↓
Notify User
↓
Temporary Download

where appropriate.

⸻

96. Communications

The system supports:

WhatsApp
Email
SMS

Communication must be implemented through an abstraction layer.

⸻

97. Communication Architecture

Conceptually:

Business Module
      │
      ▼
Communication Service
      │
      ▼
Channel Adapter
 ┌────┼─────┐
 ▼    ▼     ▼
WA   Email  SMS

Business modules should not directly call provider SDKs.

⸻

98. Provider Adapters

Examples:

WhatsAppProvider
EmailProvider
SmsProvider

Provider-specific implementation remains behind adapters.

This makes providers replaceable.

⸻

99. Provider Independence

CRM code should request:

Send WhatsApp Message

not:

Call Provider-X Endpoint Y

Provider details belong to integration infrastructure.

⸻

100. Communication Record

Create the internal communication record before or as part of queueing.

Capture relevant:

Channel
Recipient
Message / Template
Related Entity
Status
Created By
Timestamp

according to database design.

⸻

101. Communication Queue

Sending should generally be asynchronous.

Flow:

User sends message
↓
API validates request
↓
Communication record created
↓
Job queued
↓
Worker calls provider
↓
Provider responds
↓
Status updated

Do not make users wait for slow provider calls where unnecessary.

⸻

102. Communication Status

Possible normalized statuses:

Queued
Sent
Delivered
Read
Failed

Exact supported statuses depend on channel/provider.

Do not claim a status the provider cannot actually confirm.

⸻

103. Provider Status Mapping

Map provider-specific statuses into internal statuses.

Example:

Provider-specific status
↓
Internal communication status

Keep provider terminology out of normal business APIs where possible.

⸻

104. Webhooks

Providers may use webhooks for:

Delivered
Read
Failed
Inbound message

Webhook handlers must:

Verify authenticity
Parse event
Deduplicate event
Update internal state
Return quickly

⸻

105. Webhook Security

Validate provider webhook signatures/tokens according to provider requirements.

Never trust public webhook payloads without verification.

⸻

106. Webhook Idempotency

Providers may retry webhook delivery.

Processing the same event twice must not create duplicate business effects.

Store provider event IDs where available.

⸻

107. WhatsApp

WhatsApp implementation should support approved use cases such as:

Lead communication
Quotation sharing
Invoice sharing
Follow-up communication

according to project scope.

Respect provider/template requirements.

⸻

108. WhatsApp Templates

Where templates are required, store:

Internal template reference
Provider template ID/name
Language
Variables
Status

according to integration design.

Do not hardcode provider template IDs throughout business services.

⸻

109. Email

Email should use the same communication architecture.

Support approved:

Recipient
Subject
Body
Attachments
Related business entity

Do not call email provider SDKs directly from invoice/lead controllers.

⸻

110. SMS

SMS should follow the same provider abstraction.

Respect:

Message length
Template/regulatory requirements
Provider status
Delivery failure

where applicable.

⸻

111. Attachments

Documents such as:

Quotation PDF
Invoice PDF

may be attached to communications.

Generate/retrieve documents securely.

Do not expose unrestricted storage URLs.

⸻

112. File Storage

Follow ARCHITECTURE.md.

Store file metadata separately from physical object storage.

Typical metadata:

File ID
Name
MIME Type
Size
Storage Key
Related Entity
Uploaded By
Created At

⸻

113. File Security

Validate:

File size
MIME type
Extension where useful
Authorization

Do not trust client-provided MIME type alone where security matters.

⸻

114. Private Files

Business documents should normally be private.

Use authenticated downloads or short-lived signed URLs according to architecture.

Do not expose permanent public URLs for sensitive CRM documents.

⸻

115. Background Jobs

Use background jobs for operations that do not need to complete inside the API request.

Examples:

Send WhatsApp
Send Email
Send SMS
Generate large report
Generate PDF
Bulk import
Bulk export
Notification delivery

⸻

116. Job Architecture

Conceptually:

API
↓
Queue
↓
Worker
↓
Service / Provider

The API should return once the operation has been safely accepted where asynchronous behavior is appropriate.

⸻

117. Job Payloads

Keep job payloads minimal.

Prefer:

communicationId

over embedding a complete mutable customer/message object when the worker can safely load required data.

⸻

118. Job Idempotency

Jobs may be retried.

Design handlers so retries do not accidentally:

Send duplicate invoice
Duplicate stock
Create duplicate payment
Generate duplicate business records

⸻

119. Retry Strategy

Retry transient failures.

Examples:

Network timeout
Provider 503
Temporary rate limit

Do not endlessly retry permanent failures.

Examples:

Invalid phone number
Invalid template
Permission error

⸻

120. Retry Backoff

Use appropriate backoff.

Conceptually:

Attempt 1
↓
Short delay
↓
Attempt 2
↓
Longer delay
↓
Attempt 3

Avoid hammering unavailable third-party providers.

⸻

121. Dead Letter / Failed Jobs

Repeatedly failing jobs should become inspectable.

Do not allow them to disappear silently.

Store enough context for investigation without exposing secrets.

⸻

122. Idempotency

High-risk operations should support idempotency where appropriate.

Examples:

Lead Conversion
Quotation Conversion
Goods Receipt
Invoice Issue
Payment Creation
Payment Allocation
Communication Send

⸻

123. Idempotency Key

Where client-driven idempotency is used:

Idempotency-Key

may identify the logical operation.

The same request should not produce duplicate business effects.

Exact implementation follows API.md.

⸻

124. Idempotency Is Not Only API-level

Also use domain uniqueness where appropriate.

Example:

Quotation X
can only create one Sales Order

if that is the approved business rule.

⸻

125. Audit Logging

Audit important operations.

Potential:

User created
Role changed
Lead reassigned
Stock adjusted
PO approved
Invoice issued
Invoice cancelled
Payment recorded
Payment allocation changed

according to requirements.

⸻

126. Audit Record

Capture relevant:

Actor
Action
Entity Type
Entity ID
Timestamp
Before / After where appropriate
Request context

Do not store secrets in audit logs.

⸻

127. Audit Immutability

Audit history should not be casually editable through normal application APIs.

⸻

128. Soft Delete

Use soft deletion only where defined by DATABASE.md.

Do not apply soft delete to every table automatically.

Financial and inventory records often require explicit cancellation/reversal rather than deletion.

⸻

129. Delete vs Cancel

Business documents should often use:

Cancel
Void
Deactivate

rather than physical deletion.

Follow module rules.

⸻

130. Reversals

For ledger-like systems, prefer compensating/reversal records where required rather than rewriting historical transactions.

Example:

Incorrect stock movement
↓
Reversal
↓
Correct movement

if that is the approved inventory model.

⸻

131. Error Handling

Use centralized application error handling.

Error categories may include:

ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
BusinessRuleError
IntegrationError
InternalError

⸻

132. Error Response

Follow API.md.

Conceptually:

{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 12 units are currently available.",
    "requestId": "..."
  }
}

Do not expose stack traces to clients.

⸻

133. Business Error Codes

Use stable machine-readable codes.

Examples:

INSUFFICIENT_STOCK
INVALID_STATUS_TRANSITION
INVOICE_ALREADY_ISSUED
PAYMENT_OVER_ALLOCATION
PURCHASE_ORDER_ALREADY_RECEIVED

Frontend may use codes for contextual UX.

⸻

134. HTTP Status Codes

Use appropriate semantics.

Conceptually:

200
Successful read/update
201
Created
204
Successful no-content operation
400
Malformed request
401
Unauthenticated
403
Unauthorized
404
Not found
409
Business/state conflict
422
Validation where API convention uses it
500
Unexpected server failure

Follow API.md consistently.

⸻

135. Request IDs

Assign or propagate request/correlation IDs.

This allows:

Frontend error
↓
Request ID
↓
Backend logs
↓
Investigation

⸻

136. Logging

Use structured logging.

Include useful:

Request ID
Operation
Service
Duration
Result

where appropriate.

Do not log sensitive values unnecessarily.

⸻

137. Sensitive Logging

Never log:

Passwords
Authentication tokens
API secrets
OTP values
Full payment credentials
Provider credentials

Avoid logging complete customer payloads.

⸻

138. Observability

Production backend should make it possible to understand:

Request failures
Slow endpoints
Job failures
Provider failures
Database errors

according to the project’s monitoring infrastructure.

⸻

139. Health Checks

Provide health endpoints according to deployment architecture.

Possible distinction:

Liveness
Readiness

Readiness may verify required dependencies.

Do not expose sensitive infrastructure information.

⸻

140. Rate Limiting

Apply rate limits where appropriate.

Priority candidates:

Authentication
Password reset
OTP
Communication send
Public webhooks where applicable
Expensive reports

Rate limits should not unnecessarily disrupt normal CRM usage.

⸻

141. Security Headers / API Security

Use the security middleware appropriate to the selected framework.

Configure:

CORS
Request size limits
Secure cookies where used
CSRF protection where architecture requires it

according to deployment model.

⸻

142. CORS

Do not use unrestricted:

Access-Control-Allow-Origin: *

for authenticated production APIs unless there is a specific safe reason.

Use configured allowed origins.

⸻

143. Secrets

Secrets belong in:

Environment / Secret Manager

Never commit:

Database password
JWT secret
WhatsApp token
Email API key
SMS secret
Storage secret

to source control.

⸻

144. Environment Configuration

Validate required environment variables at application startup.

Fail fast if critical configuration is missing.

Do not wait until the first customer request to discover that a required secret is absent.

⸻

145. Provider Configuration

Third-party provider configuration should be centralized.

Example:

WhatsApp
Email
SMS
Storage

Business modules should not read environment variables directly.

⸻

146. Database Credentials

Use least-privilege database credentials appropriate to application requirements.

Do not use database superuser credentials for normal application operation.

⸻

147. Passwords

If the application manages passwords directly:

Use a modern secure password hashing algorithm according to the authentication architecture.

Never store plaintext passwords.

Never use reversible encryption for passwords.

⸻

148. Sessions / Tokens

Follow authentication design.

Validate:

Expiration
Signature
Session state
Revocation

where applicable.

Do not invent token behavior independently of ARCHITECTURE.md.

⸻

149. Refresh Tokens

If refresh tokens exist, implement secure:

Rotation
Expiration
Revocation
Reuse detection

where defined.

⸻

150. Data Access Security

Every resource query must consider:

Can this user access this record?

not merely:

Does this record exist?

Avoid data leakage across teams/branches/scopes.

⸻

151. Multi-tenancy

If the application is multi-tenant according to ARCHITECTURE.md, tenant isolation is mandatory.

Every tenant-owned record must be scoped correctly.

Never trust tenant ID sent by the frontend.

Resolve tenant context from authenticated identity/session.

⸻

152. Tenant Isolation

Queries must conceptually enforce:

WHERE tenant_id = authenticatedTenant

where applicable.

Cross-tenant access is a critical security failure.

⸻

153. Branch / Warehouse Scope

Where branch/warehouse restrictions exist, enforce them in backend services/queries.

Do not rely on frontend filtering.

⸻

154. Imports

Bulk imports should use:

Upload
↓
Validate
↓
Preview / Report Errors where required
↓
Process
↓
Result

according to module scope.

Do not insert partially corrupted data without clear behavior.

⸻

155. Import Validation

Validate each row.

Provide useful row-level errors.

Example:

Row 18
SKU already exists.
Row 24
Phone number is invalid.

⸻

156. Large Imports

Process large imports asynchronously.

Avoid keeping an HTTP request open while processing thousands of records.

⸻

157. Imports Must Be Idempotent Where Practical

Repeated import execution should not unexpectedly create duplicates.

Use approved matching rules.

⸻

158. Exports

Exports must respect:

Permissions
Data scope
Filters

A user must not be able to export records they cannot normally access.

⸻

159. Notifications

Business services may generate notification events.

Example:

Lead Assigned
↓
Notification created for assignee

Keep notification delivery separate from core transaction where appropriate.

⸻

160. Notification Failure

A notification failure should generally not roll back a successful core business transaction.

Example:

Lead assignment succeeded
+
Notification failed

The assignment should remain valid unless business requirements explicitly state otherwise.

⸻

161. Event-driven Side Effects

For side effects such as:

Notification
Communication
Analytics
Audit enrichment

consider event/job patterns where they reduce coupling.

Do not introduce a complex event architecture for trivial synchronous logic.

⸻

162. Outbox Pattern

For critical asynchronous side effects that must reliably follow database commits, consider a transactional outbox pattern if supported by the architecture.

Example:

Invoice Issued
+
Outbox Event

committed together.

Worker later processes:

Invoice Issued Event
→ Notification / Communication

Use only where reliability requirements justify it.

⸻

163. External API Calls

All external API calls require:

Timeout
Error handling
Retry policy where appropriate
Logging
Rate-limit awareness

Never allow an external request to wait indefinitely.

⸻

164. Circuit Breaking

For heavily used unstable external dependencies, consider circuit-breaking behavior where supported.

Do not add complex resilience infrastructure prematurely.

⸻

165. Provider Failure Isolation

WhatsApp failure must not bring down:

CRM
Billing
Inventory

Provider integrations must fail independently.

⸻

166. Provider Rate Limits

Respect provider rate limits.

Queue/throttle communication where required.

Do not allow bulk operations to unintentionally trigger provider bans.

⸻

167. PDF Generation

Quotation/invoice PDFs should use authoritative backend data.

Do not accept a frontend-generated financial document as the official source of truth.

⸻

168. PDF Snapshot Integrity

Issued financial documents should reproduce the data that existed at issue time.

Historical PDFs must not silently change because:

Customer changed address
Product changed name
Tax configuration changed

⸻

169. Time

Store canonical timestamps according to DATABASE.md.

Typically:

UTC

for system timestamps.

Convert to user/business timezone at presentation boundaries.

⸻

170. Date-only Values

Do not treat all dates as timestamps.

Examples:

Invoice Due Date
Expected Delivery Date

may be business dates.

Use appropriate database/API types.

⸻

171. Scheduled Jobs

Scheduled jobs may be used for:

Overdue calculations
Reminder generation
Cleanup
Report preparation

where required.

Do not create scheduled jobs for values that can be safely derived at query time unless performance/business behavior requires persistence.

⸻

172. Overdue Invoice

Where possible:

dueDate < today
AND
outstanding > 0

can determine overdue status.

Do not create stale duplicate flags unless architecture requires them.

⸻

173. Financial Year

Indian business document numbering may depend on financial year.

Example:

2026-27

Financial-year determination must be centralized.

Do not independently calculate it differently across:

Quotation
Sales Order
Purchase Order
Invoice

⸻

174. Locale

Backend stores raw values.

Presentation locale:

en-IN

should generally remain a client concern.

However, generated documents such as PDFs may use:

₹1,25,000.00

according to approved document formatting.

⸻

175. Database Indexes

Add indexes based on actual access patterns.

Common candidates may include:

tenant_id
status
assigned_user_id
customer_id
product_id
warehouse_id
created_at
document_number

Do not add indexes indiscriminately.

⸻

176. Composite Indexes

Use composite indexes where query patterns justify them.

Example concept:

tenant_id + status + created_at

Evaluate query behavior rather than guessing.

⸻

177. Unique Constraints

Use uniqueness constraints for true invariants.

Potential:

Tenant + SKU
Tenant + Document Number

according to database design.

Do not rely only on:

SELECT first
→ INSERT

for concurrency-sensitive uniqueness.

⸻

178. Database Query Review

Before completing an endpoint, consider:

Number of queries
Index usage
N+1 risk
Amount of selected data
Pagination
Transaction boundaries

⸻

179. Database Migrations

Every schema change requires a migration.

Migration should be:

Reviewable
Repeatable
Environment-safe

Never depend on manually editing production tables.

⸻

180. Migration Safety

For large existing tables, consider:

Locks
Backfills
Nullability transitions
Index creation cost

Do not assume development-scale migrations behave identically in production.

⸻

181. Seed Data

Seed scripts may create:

Default roles
Permissions
Development users
Required configuration

according to project setup.

Do not seed production with fake CRM/customer data.

⸻

182. Test Data

Use fictional data.

Never use real customer information in automated tests or repository fixtures.

⸻

183. Testing Strategy

Backend testing should include:

Unit Tests
Service / Domain Tests
API Integration Tests
Database Integration Tests
Critical Workflow Tests

according to project tooling.

⸻

184. Unit Tests

Good candidates:

Financial year calculation
Document numbering helpers
Permission logic
Tax calculations
Money calculations
Status transition rules
Validation

⸻

185. Service Tests

Test business operations.

Examples:

Lead conversion
Quotation conversion
Sales order confirmation
Goods receipt
Invoice issue
Payment allocation

⸻

186. Database Integration Tests

High-integrity operations should be tested against a real test database where practical.

Examples:

Transactions
Constraints
Concurrency-sensitive behavior
Inventory movements
Payment allocations

Mocks cannot fully validate database behavior.

⸻

187. API Tests

Test:

Authentication
Authorization
Validation
Success response
Error response
Pagination
Filtering
Business conflicts

⸻

188. Permission Tests

For sensitive endpoints test at minimum:

Authorized user succeeds.
Unauthorized user fails.
Unauthenticated request fails.
Out-of-scope record fails.

⸻

189. Financial Tests

Use exact decimal assertions.

Test:

Discount
Tax
Rounding
Partial payments
Multiple allocations
Outstanding amount

Do not rely on approximate floating-point comparisons for money.

⸻

190. Inventory Tests

Test:

Receipt increases stock.
Issue decreases stock.
Adjustment records reason.
Concurrent operations preserve integrity.
Duplicate request does not duplicate movement.

⸻

191. Integration Tests

Mock external provider boundaries.

Do not call live:

WhatsApp
Email
SMS

providers from normal automated test suites.

⸻

192. Webhook Tests

Test:

Valid signature
Invalid signature
Duplicate event
Known status
Unknown status
Missing communication reference

⸻

193. Job Tests

Test:

Success
Transient failure
Permanent failure
Retry
Duplicate execution

for critical jobs.

⸻

194. Critical Workflow Tests

Priority workflows:

Authentication
Lead
→ Follow-up
Lead
→ Customer
Quotation
→ Sales Order
Purchase Order
→ Goods Receipt
→ Inventory
Sales Order
→ Invoice
Invoice
→ Payment
→ Allocation
Invoice
→ Communication

⸻

195. Performance Tests

Performance-sensitive candidates:

Lead list
Product search
Inventory list
Dashboard
Reports
Large exports

Test where expected data volumes justify it.

⸻

196. API Documentation

Keep API documentation aligned with implementation.

When an endpoint changes:

Implementation
+
API documentation
+
Types
+
Tests

must remain synchronized.

⸻

197. Breaking Changes

Do not casually introduce breaking API changes.

Remember:

Web App
+
Future Mobile App

may depend on the API independently.

Prefer backward-compatible evolution where practical.

⸻

198. Mobile API Readiness

Do not create backend endpoints tightly coupled to desktop UI structure.

Bad:

GET /dashboard-left-card-three

Prefer business-oriented APIs.

The future mobile app should be able to reuse backend capabilities.

⸻

199. API Client Independence

Backend must not assume requests originate only from:

React Web App

The same API should support authorized:

Mobile App
Internal integrations
Future approved clients

⸻

200. API Versioning

Use the API versioning strategy defined in API.md.

Do not introduce a new version for every small additive change.

⸻

201. Claude Implementation Process

Before implementing a backend feature:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read BACKEND.md.
5. Read ARCHITECTURE.md.
6. Read DATABASE.md.
7. Read API.md.
8. Read relevant module document.
9. Inspect existing implementation.
10. Identify business rules.
11. Identify permissions.
12. Identify transaction boundaries.
13. Identify audit requirements.
14. Identify idempotency requirements.
15. Identify side effects.
16. Identify integration requirements.
17. Implement.
18. Test.
19. Review database behavior.
20. Review security.
21. Review API contract.

⸻

202. Claude Must Inspect Existing Code

Before creating a new:

Service
Repository
Validator
Utility
Provider adapter
Job
Error type
Middleware
Database model

search the existing codebase.

Reuse existing patterns.

Do not create duplicate infrastructure.

⸻

203. Claude Database Change Rule

Before changing schema:

Identify requirement
Inspect DATABASE.md
Inspect existing schema
Determine migration
Consider existing data
Consider indexes
Consider rollback/recovery
Update documentation

Do not casually modify schema to make one endpoint easier.

⸻

204. Claude Transaction Rule

For every multi-write operation ask:

What happens if the process fails halfway?

If partial completion would violate business integrity:

Use a transaction

or an appropriate reliable workflow architecture.

⸻

205. Claude External Side-effect Rule

For every external side effect ask:

Should this happen before or after database commit?
What happens if provider fails?
Can it be retried?
Can it happen twice?
How do we detect success?

⸻

206. Claude Idempotency Rule

For every high-impact operation ask:

What happens if the client retries this request?

The answer must not be:

It creates another invoice/payment/receipt.

unless duplicates are explicitly intended.

⸻

207. Claude Permission Rule

For every endpoint ask:

Who can call this?
Which records can they access?
Can they modify this record?
Does status affect permission?

Never assume authentication alone is enough.

⸻

208. Claude Audit Rule

For every sensitive operation ask:

Would management need to know who did this six months later?

If yes, audit appropriately.

⸻

209. Claude Financial Rule

For every monetary operation:

Use decimal-safe arithmetic.
Recalculate server-side.
Apply approved rounding.
Do not trust frontend totals.
Preserve historical snapshots.

⸻

210. Claude Inventory Rule

For every stock operation:

Use inventory movement.
Use transaction.
Validate current authoritative state.
Consider concurrency.
Preserve reference.
Preserve actor.
Prevent duplicates.

⸻

211. Claude Integration Rule

For third-party services:

Use adapter.
Set timeout.
Normalize errors.
Protect credentials.
Consider retries.
Consider rate limits.
Make processing idempotent.
Log safely.

⸻

212. Claude Refactoring Rule

Do not refactor unrelated backend code during a focused feature implementation unless:

Existing architecture blocks correct implementation

or:

A security/data-integrity issue requires correction.

Keep changes reviewable.

⸻

213. Claude Dependency Rule

Before installing a backend package:

Check existing dependencies.
Determine whether it is necessary.
Evaluate maintenance.
Evaluate security.
Evaluate compatibility.
Explain the reason.

Avoid unnecessary dependencies.

⸻

214. Claude Must Not

Do NOT:

* Invent business rules.
* Invent API contracts.
* Add features outside approved scope.
* Trust frontend validation.
* Trust frontend permissions.
* Trust frontend financial totals.
* Trust frontend stock availability.
* Directly edit inventory quantities.
* Allow arbitrary status changes.
* Use floating-point money arithmetic.
* Expose secrets.
* Log passwords/tokens.
* Call providers directly from business controllers.
* Hold DB transactions open during slow external API calls.
* Ignore concurrency.
* Ignore idempotency.
* Ignore auditability.
* Ignore resource scope.
* Return unlimited datasets.
* Create N+1 query patterns knowingly.
* Modify schema without migrations.
* Delete financial history casually.
* Modify issued financial documents casually.
* Duplicate provider logic.
* Ignore webhook verification.
* Ignore duplicate webhook events.
* Retry permanent provider failures endlessly.
* Store formatted currency as numeric business data.
* Couple APIs to one desktop screen.
* Use production customer data in tests.
* Return stack traces to users.
* Mark critical operations successful before database commit.
* Hide failures.

⸻

215. Backend Completion Definition

A backend task is NOT complete simply when:

The endpoint returns 200.

It is complete when relevant:

Authentication works.
Authorization works.
Validation works.
Business rules work.
Transaction behavior is correct.
Concurrency is considered.
Idempotency is considered.
Audit behavior is correct.
Error responses are correct.
Database constraints are respected.
API contract is correct.
Tests pass.
Documentation is updated.
Security is reviewed.

⸻

216. CRM Completion Checklist

For CRM operations verify:

Ownership correct?
Scope enforced?
Follow-up rules correct?
Activity created where needed?
Assignment audited?
Conversion idempotent?
Duplicates considered?

⸻

217. Sales Completion Checklist

Verify:

Customer valid?
Products valid?
Quantities valid?
Prices valid?
Tax correct?
Totals server-calculated?
Status transition valid?
Source relationship preserved?
Conversion idempotent?

⸻

218. Inventory Completion Checklist

Verify:

Movement created?
Warehouse correct?
Quantity correct?
Direction correct?
Reference preserved?
Transaction used?
Concurrency handled?
Duplicate request safe?
Audit available?

⸻

219. Purchase Completion Checklist

Verify:

Supplier valid?
PO state valid?
Ordered quantity preserved?
Received quantity correct?
Partial receipt correct?
Over-receipt rule enforced?
Inventory updated atomically?
Duplicate receipt prevented?

⸻

220. Billing Completion Checklist

Verify:

Invoice totals server-calculated?
Tax correct?
Historical snapshot preserved?
Issue transition valid?
Issued document protected?
Payment amount valid?
Allocation correct?
Concurrency handled?
Outstanding derived correctly?
Financial audit preserved?

⸻

221. Communication Completion Checklist

Verify:

Recipient valid?
Channel configured?
Provider abstracted?
Communication recorded?
Job queued?
Credentials protected?
Timeout configured?
Retries appropriate?
Duplicate send prevented?
Webhook verified?
Webhook deduplicated?
Status normalized?
Failure inspectable?

⸻

222. Reports Completion Checklist

Verify:

Permission enforced?
Scope enforced?
Date filters valid?
Metric definition correct?
Query efficient?
Pagination used?
Export safe?
Large workload handled appropriately?

⸻

223. Security Completion Checklist

Before considering a backend module production-ready verify:

Authentication
Authorization
Tenant/team scope
Input validation
SQL/query safety
Secret handling
Sensitive logging
Rate limiting where needed
File validation where needed
Webhook verification where needed
Error sanitization

⸻

224. Reliability Completion Checklist

Verify:

Transaction boundaries
Timeouts
Retries
Idempotency
Job failure handling
Provider failure isolation
Concurrency
Database constraints
Request tracing

⸻

225. Performance Completion Checklist

Verify:

Pagination
Indexes
N+1 queries
Selected fields
Query count
Large payloads
Long-running work
Report complexity

⸻

226. Future Mobile Standard

The backend should make it possible for a future mobile app to perform approved mobile workflows without requiring a second backend.

The architecture should remain:

                ┌─────────────┐
                │   Web App   │
                └──────┬──────┘
                       │
                       │
                       ▼
                ┌─────────────┐
                │     API     │
                └──────┬──────┘
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
           Domain   Database  Integrations
Future:
                ┌─────────────┐
                │   Web App   │
                └──────┬──────┘
                       │
                       │
                ┌──────▼──────┐
                │     API     │
                └──────▲──────┘
                       │
                       │
                ┌──────┴──────┐
                │ Mobile App  │
                └─────────────┘

The mobile app should be another client of the same business platform.

⸻

227. Business Integrity Priority

When priorities conflict, use:

1. Security
2. Data Integrity
3. Financial Integrity
4. Inventory Integrity
5. Business Rule Correctness
6. Auditability
7. Reliability
8. API Consistency
9. Performance
10. Developer Convenience

Never weaken a financial or inventory rule merely to simplify frontend implementation.

⸻

228. Practical Engineering Principle

Do not over-engineer.

This CRM should have strong architecture without becoming an unnecessarily complex distributed system.

Prefer:

Well-structured modular application
+
Relational database
+
Background job processing
+
Provider adapters
+
Clear APIs

over prematurely introducing:

Dozens of microservices
Complex event buses
Distributed transactions
Multiple databases
Excessive abstraction layers

unless actual scale or requirements justify them.

⸻

229. Scale Principle

Design for reasonable growth.

Do not optimize for:

Millions of requests per second

when building a distributor CRM.

Do design for:

Growing users
Growing lead volume
Large product catalogs
Years of invoices
Years of stock movements
Increasing communication volume
Future mobile usage

⸻

230. Simplicity Principle

Prefer:

Simple
+
Correct
+
Observable
+
Testable

over:

Clever
+
Complex
+
Hard to debug

⸻

231. Final Backend Principle

The backend is the business authority of the CRM.

Its responsibility is to guarantee:

Correct person
+
Correct permission
+
Correct operation
+
Correct data
+
Correct business state
+
Correct transaction

before committing a business change.

The overall architecture should remain:

                  PROJECT.md
                       │
                       ▼
               Business Modules
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
      UX.md       FRONTEND.md    BACKEND.md
                                     │
                         ┌───────────┼───────────┐
                         ▼           ▼           ▼
                    API.md     DATABASE.md  ARCHITECTURE.md
                         │           │           │
                         └───────────┼───────────┘
                                     ▼
                              Backend Platform
                                     │
                   ┌─────────────────┼─────────────────┐
                   ▼                 ▼                 ▼
               Database        Background Jobs   Integrations
                                                     │
                                      ┌──────────────┼──────────────┐
                                      ▼              ▼              ▼
                                  WhatsApp         Email            SMS

The backend must remain independent of a specific frontend client so the same platform can support:

Web Application
+
Future Mobile Application
+
Future Approved Integrations

without duplicating business logic.

Every backend decision should ultimately protect:

Customer Data
Lead History
Sales Data
Inventory
Purchase Records
Invoices
Payments
Communication History
Team Accountability

while keeping the system practical to build, operate, maintain, debug, and extend.

When choosing between:

Fast implementation that bypasses domain integrity

and:

Slightly more structured implementation that protects business integrity

choose the structured implementation.

When choosing between:

Complex architecture for hypothetical future scale

and:

Simple architecture that cleanly supports current requirements and future extension

choose the simple architecture.