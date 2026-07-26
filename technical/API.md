API.md

Electrical Distribution CRM — API Design Specification

Version: 1.0
Status: Technical API Specification
Category: Technical
Base API Version: v1

Related Documents:

* PROJECT.md
* PROJECT_SETUP.md
* CLAUDE.md
* ARCHITECTURE.md
* DATABASE.md
* CRM.md
* SALES.md
* INVENTORY.md
* PURCHASE.md
* BILLING.md
* REPORTS.md

⸻

1. Purpose

This document defines the API architecture and conventions for the Electrical Distribution CRM.

The API is the primary application interface between:

Web Application
       │
       ▼
     API
       ▲
       │
Future Mobile Application

and potentially later:

Approved External Systems
       │
       ▼
      API

The API must support:

* Authentication
* Users
* Teams
* Roles
* Permissions
* Leads
* Contacts
* Companies
* Customers
* Suppliers
* Follow-ups
* Activities
* Products
* Categories
* Brands
* Inventory
* Warehouses
* Quotations
* Sales Orders
* Purchase Orders
* Goods Receipts
* Invoices
* Payments
* Reports
* WhatsApp
* Email
* SMS
* Communication History
* Files
* Notifications
* Audit-related operations
* Application Settings
* Third-party integrations

⸻

2. API Principles

All APIs should follow these principles:

1. REST-oriented
2. Versioned
3. Resource-based
4. Predictable
5. Consistent
6. Secure
7. Permission-aware
8. Mobile-ready
9. Pagination-first
10. Filterable
11. Sortable
12. Searchable where appropriate
13. Idempotent where necessary
14. Transactionally safe
15. Provider-independent
16. Properly validated
17. Observable
18. Documented

⸻

3. Base URL

All application endpoints should live under:

/api/v1

Examples:

/api/v1/leads
/api/v1/products
/api/v1/sales-orders
/api/v1/invoices

Do not create unversioned production APIs such as:

/api/leads

⸻

4. Why API Versioning Starts Now

The application will initially have:

Web Application

but may later add:

Mobile Application

Mobile applications cannot always be updated immediately.

An older mobile version may continue using an API after the web application has moved forward.

Therefore API compatibility must be considered from the beginning.

⸻

5. API Architecture

Conceptually:

Client
   │
   ▼
HTTP Request
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Application / Domain Service
   │
   ▼
Repository / Data Layer
   │
   ▼
PostgreSQL

For asynchronous external operations:

Client
   │
   ▼
API
   │
   ▼
Domain Service
   │
   ▼
Communication / Job Record
   │
   ▼
Queue
   │
   ▼
Worker
   │
   ▼
Provider

⸻

6. API Responsibilities

The API/backend owns:

* Authentication enforcement
* Authorization
* Business validation
* Financial calculations
* Tax calculations
* Inventory validation
* Workflow transitions
* Database transactions
* Document numbering
* Audit creation
* Integration orchestration
* File authorization
* Data scoping

The frontend must not be treated as authoritative for these operations.

⸻

7. Resource Naming

Use plural nouns.

Good:

/leads
/contacts
/companies
/products
/quotations
/sales-orders
/purchase-orders
/invoices
/payments

Avoid:

/getLeads
/createLead
/updateLead

HTTP methods already communicate common CRUD intent.

⸻

8. URL Naming

Use lowercase kebab-case.

Example:

/purchase-orders
/sales-orders
/lead-sources
/stock-movements
/payment-allocations

Avoid mixing:

salesOrders
sales_orders
SalesOrders

⸻

9. HTTP Methods

Use:

GET
→ Read
POST
→ Create / execute a non-idempotent command
PATCH
→ Partial update
PUT
→ Full replacement only where genuinely appropriate
DELETE
→ Delete/archive only where business rules allow

Do not use POST for every API operation.

⸻

10. Standard CRUD Pattern

Example:

GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/{leadId}
PATCH  /api/v1/leads/{leadId}
DELETE /api/v1/leads/{leadId}

However, DELETE behavior depends on the domain.

For important business records, archival may be more appropriate than physical deletion.

⸻

11. Business Actions

Some operations represent commands rather than CRUD.

Example:

POST /leads/{leadId}/assign
POST /leads/{leadId}/convert
POST /quotations/{quotationId}/send
POST /sales-orders/{salesOrderId}/confirm
POST /purchase-orders/{purchaseOrderId}/approve
POST /goods-receipts
POST /invoices/{invoiceId}/issue
POST /payments

Explicit business actions are preferable when they represent meaningful workflow transitions.

⸻

12. Avoid Generic Status APIs

Avoid:

PATCH /sales-orders/{id}
{
  "status": "confirmed"
}

for important transitions if confirmation has significant business consequences.

Prefer:

POST /sales-orders/{id}/confirm

because confirmation may trigger:

* Validation
* Inventory logic
* Audit
* Notifications
* Other workflow effects

⸻

13. Authentication

Protected API endpoints require authenticated users.

Authentication implementation follows PROJECT_SETUP.md.

Conceptually:

Client
↓
Authenticate
↓
Receive / Maintain Session or Token
↓
Call Protected API

Authentication architecture must support both:

Web
+
Future Mobile

⸻

14. Authentication Endpoints

Depending on selected authentication infrastructure:

POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password

Some endpoints may instead be handled directly by the selected identity provider.

Do not duplicate identity-provider functionality unnecessarily.

⸻

15. Current User

Provide:

GET /api/v1/me

Potential response:

{
  "data": {
    "id": "uuid",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul@example.com",
    "roles": ["sales_executive"],
    "permissions": [
      "lead.read",
      "lead.create",
      "lead.update"
    ]
  }
}

This helps clients initialize the authenticated application.

⸻

16. Authorization

Every protected operation must validate:

Authentication
+
Permission
+
Data Scope

Example:

Sales Executive
→ Can view own leads
Sales Manager
→ Can view team leads
Administrator
→ Can view all leads

⸻

17. Permission Enforcement

Frontend:

Hide / Disable unavailable action

Backend:

Actually enforce permission

Never assume hidden UI equals security.

⸻

18. Data Scope

List APIs must respect authorization scope.

Example:

GET /leads

must not automatically return all leads merely because the user has basic lead.read permission.

The service must also determine whether the user can access:

Own
Team
All

records.

⸻

19. HTTP Status Codes

Use standard HTTP semantics.

200 OK
→ Successful read/update/action
201 Created
→ Resource created
202 Accepted
→ Asynchronous operation accepted
204 No Content
→ Successful operation with no response body
400 Bad Request
→ Malformed request
401 Unauthorized
→ Authentication required/invalid
403 Forbidden
→ Authenticated but insufficient permission
404 Not Found
→ Resource unavailable/not accessible
409 Conflict
→ State/duplicate/concurrency conflict
422 Unprocessable Entity
→ Validation/business rule failure
429 Too Many Requests
→ Rate limit
500 Internal Server Error
→ Unexpected server failure

⸻

20. Standard Success Response

Single resource:

{
  "data": {
    "id": "uuid",
    "name": "Example"
  }
}

Do not unnecessarily wrap responses in several meaningless layers.

⸻

21. Collection Response

Example:

{
  "data": [
    {
      "id": "uuid",
      "name": "Example"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 245,
    "totalPages": 10
  }
}

⸻

22. Standard Error Response

Use a predictable structure.

Example:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "fields": {
      "phone": [
        "Enter a valid phone number."
      ]
    },
    "requestId": "req_uuid"
  }
}

⸻

23. Error Codes

Machine-readable codes should remain stable.

Examples:

VALIDATION_ERROR
AUTHENTICATION_REQUIRED
PERMISSION_DENIED
RESOURCE_NOT_FOUND
DUPLICATE_RESOURCE
INVALID_STATE_TRANSITION
INSUFFICIENT_STOCK
PAYMENT_ALLOCATION_EXCEEDED
DOCUMENT_ALREADY_ISSUED
INTEGRATION_UNAVAILABLE

Frontend logic should not depend on matching human-readable error messages.

⸻

24. Internal Errors

Never return:

SQL queries
Stack traces
Database credentials
Internal file paths
Provider secrets
Raw exception dumps

to clients.

Log internal details securely using the request ID.

⸻

25. Request ID

Every API request should receive a request/correlation identifier.

Example response header:

X-Request-ID: req_...

Errors should include the request ID.

This helps production debugging.

⸻

26. Pagination

Collection APIs must support pagination.

Recommended:

?page=1&pageSize=25

Example:

GET /api/v1/leads?page=1&pageSize=25

Set sensible maximum page sizes.

Do not permit:

?pageSize=1000000

⸻

27. Default Pagination

Recommended initial defaults:

page = 1
pageSize = 25
maximum pageSize = 100

Specific endpoints may use different limits where justified.

⸻

28. Future Cursor Pagination

Offset/page pagination is sufficient initially.

Cursor pagination may later be introduced for:

* Very large activity feeds
* Communication histories
* Audit timelines

Do not add cursor complexity everywhere prematurely.

⸻

29. Sorting

Use:

?sort=createdAt&order=desc

Example:

GET /leads?sort=createdAt&order=desc

Only allow known sortable fields.

Do not directly interpolate arbitrary client-provided column names into SQL.

⸻

30. Filtering

Example:

GET /leads?status=qualified&assignedTo={userId}

Multiple filters may be combined.

Examples:

status
source
assignedTo
teamId
priority
dateFrom
dateTo

Exact filters depend on each module.

⸻

31. Search

Use a consistent query parameter:

?q=

Example:

GET /companies?q=prakash

Potential search fields:

Company Name
Contact Name
Phone
Email
SKU
Document Number

Search behavior should be documented per endpoint.

⸻

32. Date Filtering

Recommended convention:

?dateFrom=2026-07-01&dateTo=2026-07-31

Use ISO date format:

YYYY-MM-DD

⸻

33. Timestamp Format

Use ISO 8601 timestamps.

Example:

2026-07-26T10:30:00Z

Do not return ambiguous date/time strings.

⸻

34. API Field Naming

Use one convention consistently.

Recommended JSON:

camelCase

Example:

{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "createdAt": "2026-07-26T10:30:00Z"
}

Database naming may remain:

snake_case

The API does not need to expose database naming directly.

⸻

35. IDs

Expose stable system IDs.

Example:

{
  "id": "c69ed436-..."
}

Do not require clients to use database sequence numbers.

Business document numbers remain separate:

{
  "id": "uuid",
  "invoiceNumber": "INV/HYD/2026-27/001245"
}

⸻

36. Monetary API Values

Money must retain decimal precision.

Example:

{
  "subtotal": "125000.00",
  "taxAmount": "22500.00",
  "totalAmount": "147500.00",
  "currencyCode": "INR"
}

String-encoded decimals are recommended where necessary to avoid floating-point precision loss across clients.

Display formatting belongs to clients.

Example UI:

₹1,47,500.00

⸻

37. Financial Calculation Rule

Clients may send:

quantity
unitPrice
discount

but authoritative totals are recalculated by the backend.

Do not trust:

{
  "totalAmount": "50000"
}

merely because the frontend submitted it.

⸻

38. CRM Endpoints

Primary resources:

/leads
/lead-sources
/lead-activities
/follow-ups
/contacts
/companies

⸻

39. Lead APIs

GET    /leads
POST   /leads
GET    /leads/{leadId}
PATCH  /leads/{leadId}
DELETE /leads/{leadId}

Deletion may mean archive depending on CRM.md.

⸻

40. Lead Assignment

POST /leads/{leadId}/assign

Example request:

{
  "userId": "uuid"
}

or where team assignment is supported:

{
  "teamId": "uuid",
  "userId": "uuid"
}

Backend must verify assignment permissions.

⸻

41. Lead Status Transition

If lead status changes have business significance:

POST /leads/{leadId}/status

Request:

{
  "status": "qualified",
  "notes": "Customer requested quotation."
}

Alternatively simple status edits may use PATCH if CRM.md allows it.

Use explicit actions when workflow side effects exist.

⸻

42. Lead Conversion

POST /leads/{leadId}/convert

Conceptually this may:

Create / match Company
Create / match Contact
Link records
Update Lead
Create Activity
Create Audit

as one transaction.

⸻

43. Lead Activities

GET  /leads/{leadId}/activities
POST /leads/{leadId}/activities

Examples:

* Call
* Meeting
* Note
* Follow-up
* Status history

⸻

44. Follow-ups

GET    /follow-ups
POST   /follow-ups
GET    /follow-ups/{followUpId}
PATCH  /follow-ups/{followUpId}

Actions:

POST /follow-ups/{followUpId}/complete
POST /follow-ups/{followUpId}/cancel

⸻

45. My Follow-ups

Useful operational endpoint:

GET /me/follow-ups

Possible filters:

?status=pending
?dateFrom=...
?dateTo=...

This avoids clients manually filtering unrestricted follow-up datasets.

⸻

46. Contacts

GET    /contacts
POST   /contacts
GET    /contacts/{contactId}
PATCH  /contacts/{contactId}
DELETE /contacts/{contactId}

Delete/archive behavior follows database/domain rules.

⸻

47. Companies

GET    /companies
POST   /companies
GET    /companies/{companyId}
PATCH  /companies/{companyId}
DELETE /companies/{companyId}

Possible filters:

?type=dealer
?isCustomer=true
?isSupplier=true

⸻

48. Company Detail Subresources

Useful endpoints:

GET /companies/{companyId}/contacts
GET /companies/{companyId}/quotations
GET /companies/{companyId}/sales-orders
GET /companies/{companyId}/invoices
GET /companies/{companyId}/payments
GET /companies/{companyId}/communications

Each collection remains paginated.

⸻

49. Product APIs

Resources:

/products
/product-categories
/brands
/units

⸻

50. Products

GET    /products
POST   /products
GET    /products/{productId}
PATCH  /products/{productId}
DELETE /products/{productId}

Possible filters:

?q=
?categoryId=
?brandId=
?isActive=

⸻

51. Product Search

Operational product selection may use:

GET /products?q=fan

Return only fields needed for selection where practical.

Do not return full inventory history for every product-search result.

⸻

52. Categories

GET    /product-categories
POST   /product-categories
PATCH  /product-categories/{categoryId}

Deletion depends on whether products reference the category.

⸻

53. Brands

GET    /brands
POST   /brands
PATCH  /brands/{brandId}

⸻

54. Units

GET /units

Administrative APIs may include:

POST  /units
PATCH /units/{unitId}

depending on requirements.

⸻

55. Inventory APIs

Resources:

/warehouses
/inventory
/stock-movements

Inventory must not behave as unrestricted CRUD.

⸻

56. Warehouses

GET    /warehouses
POST   /warehouses
GET    /warehouses/{warehouseId}
PATCH  /warehouses/{warehouseId}

⸻

57. Inventory List

GET /inventory

Potential filters:

?warehouseId=
?productId=
?categoryId=
?brandId=
?q=
?stockStatus=low

Response may include:

{
  "productId": "uuid",
  "warehouseId": "uuid",
  "onHandQuantity": "120.00",
  "reservedQuantity": "20.00",
  "availableQuantity": "100.00"
}

⸻

58. Product Inventory

GET /products/{productId}/inventory

Useful for product details and sales workflows.

⸻

59. Stock Movements

GET /stock-movements

Filters:

?productId=
?warehouseId=
?movementType=
?dateFrom=
?dateTo=

Stock movement history should normally be read-only to clients.

⸻

60. Inventory Adjustment

Use an explicit operation:

POST /inventory/adjustments

Example:

{
  "productId": "uuid",
  "warehouseId": "uuid",
  "quantityDelta": "-2.00",
  "reason": "Damaged stock",
  "notes": "Two units damaged during handling."
}

Backend creates the appropriate stock movement.

Do not expose:

PATCH /inventory/{id}

for arbitrary quantity changes.

⸻

61. Inventory Availability

Sales workflows may use:

GET /inventory/availability

Example query:

?productId={id}&warehouseId={id}&quantity=25

This is useful for UI feedback.

However, availability must be revalidated during authoritative order operations.

⸻

62. Quotation APIs

GET    /quotations
POST   /quotations
GET    /quotations/{quotationId}
PATCH  /quotations/{quotationId}

Actions may include:

POST /quotations/{quotationId}/send
POST /quotations/{quotationId}/accept
POST /quotations/{quotationId}/reject
POST /quotations/{quotationId}/convert-to-order

Exact workflow follows SALES.md.

⸻

63. Quotation Creation

Example request:

{
  "customerCompanyId": "uuid",
  "contactId": "uuid",
  "leadId": "uuid",
  "quotationDate": "2026-07-26",
  "validUntil": "2026-08-09",
  "items": [
    {
      "productId": "uuid",
      "quantity": "10.00",
      "unitPrice": "2500.00",
      "discountPercentage": "5.00"
    }
  ],
  "notes": "Delivery within 7 working days."
}

Backend calculates authoritative tax and totals.

⸻

64. Quotation Response

Response should include calculated values:

{
  "data": {
    "id": "uuid",
    "quotationNumber": "QT/HYD/2026-27/000124",
    "subtotal": "25000.00",
    "discountAmount": "1250.00",
    "taxAmount": "4275.00",
    "totalAmount": "28025.00",
    "currencyCode": "INR",
    "status": "draft"
  }
}

Values above are examples only.

⸻

65. Quotation PDF

Potential:

GET /quotations/{quotationId}/pdf

The endpoint may:

* Stream authorized document
* Redirect to temporary signed storage
* Return generated-file metadata

depending on storage architecture.

⸻

66. Sales Orders

GET    /sales-orders
POST   /sales-orders
GET    /sales-orders/{salesOrderId}
PATCH  /sales-orders/{salesOrderId}

Business actions:

POST /sales-orders/{salesOrderId}/confirm
POST /sales-orders/{salesOrderId}/cancel
POST /sales-orders/{salesOrderId}/complete

Exact states follow SALES.md.

⸻

67. Convert Quotation to Order

Recommended:

POST /quotations/{quotationId}/convert-to-order

rather than requiring the client to manually recreate every quotation item.

Backend should preserve traceability:

Quotation
↓
Sales Order

⸻

68. Sales Order Confirmation

Confirmation may:

Validate state
Validate customer
Validate products
Validate stock where required
Reserve stock where implemented
Update order state
Create audit
Create notifications

Perform critical writes transactionally.

⸻

69. Purchase APIs

Resources:

/purchase-orders
/goods-receipts

Supplier information is represented through company/supplier domain APIs.

⸻

70. Purchase Orders

GET    /purchase-orders
POST   /purchase-orders
GET    /purchase-orders/{purchaseOrderId}
PATCH  /purchase-orders/{purchaseOrderId}

Actions:

POST /purchase-orders/{purchaseOrderId}/submit
POST /purchase-orders/{purchaseOrderId}/approve
POST /purchase-orders/{purchaseOrderId}/cancel
POST /purchase-orders/{purchaseOrderId}/send

Exact states follow PURCHASE.md.

⸻

71. Purchase Order Creation

Example:

{
  "supplierCompanyId": "uuid",
  "poDate": "2026-07-26",
  "expectedDeliveryDate": "2026-08-02",
  "items": [
    {
      "productId": "uuid",
      "orderedQuantity": "100.00",
      "unitPrice": "850.00"
    }
  ]
}

Backend calculates authoritative totals.

⸻

72. Goods Receipts

GET  /goods-receipts
POST /goods-receipts
GET  /goods-receipts/{goodsReceiptId}

⸻

73. Goods Receipt Creation

Example:

{
  "purchaseOrderId": "uuid",
  "warehouseId": "uuid",
  "receiptDate": "2026-07-30",
  "supplierDocumentNumber": "SUP-DC-9182",
  "items": [
    {
      "purchaseOrderItemId": "uuid",
      "quantityReceived": "40.00"
    }
  ]
}

⸻

74. Goods Receipt Backend Transaction

The API must coordinate:

Validate PO
↓
Validate Remaining Quantity
↓
Create Receipt
↓
Create Receipt Items
↓
Create Stock Movements
↓
Update Inventory
↓
Update PO Received Quantities
↓
Recalculate PO State
↓
Audit

as a transactional operation.

⸻

75. Billing APIs

Resources:

/invoices
/payments

⸻

76. Invoices

GET    /invoices
POST   /invoices
GET    /invoices/{invoiceId}
PATCH  /invoices/{invoiceId}

Business actions:

POST /invoices/{invoiceId}/issue
POST /invoices/{invoiceId}/send
POST /invoices/{invoiceId}/cancel

Cancellation behavior must follow BILLING.md.

⸻

77. Invoice Creation from Sales Order

Where applicable:

POST /sales-orders/{salesOrderId}/create-invoice

This is preferable to requiring clients to manually duplicate order information.

Backend should:

Load Sales Order
↓
Validate
↓
Snapshot Commercial Data
↓
Calculate Tax
↓
Create Invoice
↓
Create Invoice Items

⸻

78. Invoice PDF

GET /invoices/{invoiceId}/pdf

Access must require authorization.

Do not make invoice files permanently public.

⸻

79. Invoice Send

POST /invoices/{invoiceId}/send

Example:

{
  "channel": "email",
  "recipient": "billing@example.com"
}

or:

{
  "channel": "whatsapp",
  "recipient": "+919876543210"
}

The API should create a communication request rather than directly coupling billing to provider code.

⸻

80. Payment APIs

GET  /payments
POST /payments
GET  /payments/{paymentId}

Payment editing/reversal behavior must follow BILLING.md.

⸻

81. Payment Creation

Example:

{
  "customerCompanyId": "uuid",
  "paymentDate": "2026-07-26",
  "amount": "50000.00",
  "currencyCode": "INR",
  "paymentMethod": "bank_transfer",
  "referenceNumber": "UTR123456789",
  "allocations": [
    {
      "invoiceId": "uuid",
      "amount": "30000.00"
    },
    {
      "invoiceId": "uuid",
      "amount": "20000.00"
    }
  ]
}

Backend must verify allocation integrity.

⸻

82. Payment Validation

Backend should validate:

Allocation amount > 0
Total allocations <= payment amount
Allocation <= invoice outstanding amount
Invoice belongs to valid customer/context
Payment currency compatibility
User has payment permission

Do not trust client-calculated outstanding balances.

⸻

83. Outstanding Invoices

Useful endpoint:

GET /companies/{companyId}/outstanding-invoices

This helps payment-entry workflows.

⸻

84. Communication APIs

Resources:

/communications
/communication-templates

Communication supports:

WhatsApp
Email
SMS

⸻

85. Send Communication

Recommended:

POST /communications

Example:

{
  "channel": "whatsapp",
  "recipient": "+919876543210",
  "templateId": "uuid",
  "relatedEntityType": "lead",
  "relatedEntityId": "uuid",
  "variables": {
    "customer_name": "Rajesh"
  }
}

⸻

86. Asynchronous Communication Response

Communication delivery should generally return:

202 Accepted

Example:

{
  "data": {
    "id": "uuid",
    "status": "queued"
  }
}

The user should not wait for the provider’s full delivery lifecycle.

⸻

87. Communication History

GET /communications

Filters:

?channel=whatsapp
?status=delivered
?relatedEntityType=lead
?relatedEntityId={uuid}
?dateFrom=
?dateTo=

⸻

88. Entity Communications

Convenient endpoints may include:

GET /leads/{leadId}/communications
GET /companies/{companyId}/communications
GET /invoices/{invoiceId}/communications

These should internally use the same communication domain.

⸻

89. Communication Templates

GET    /communication-templates
POST   /communication-templates
GET    /communication-templates/{templateId}
PATCH  /communication-templates/{templateId}

Possible filters:

?channel=whatsapp
?purpose=invoice
?status=active

⸻

90. WhatsApp Templates

Provider-approved WhatsApp templates may have provider-specific metadata.

Keep that metadata behind the communication/integration abstraction.

Business APIs should not become provider-specific.

⸻

91. Webhook Endpoints

Provider webhook endpoints may live separately.

Example:

POST /api/v1/webhooks/whatsapp/{provider}
POST /api/v1/webhooks/email/{provider}
POST /api/v1/webhooks/sms/{provider}

Exact URLs depend on integration implementation.

⸻

92. Webhook Authentication

Webhook handlers must:

Verify Provider
↓
Verify Signature / Token
↓
Identify Event
↓
Check Idempotency
↓
Process
↓
Return Provider-compatible Response

Never trust webhook requests solely because they reached the correct URL.

⸻

93. Webhook Idempotency

If the same provider event arrives multiple times:

Event A
Event A
Event A

it should not cause:

Three Payments
Three Messages
Three Inventory Updates

Process external events idempotently.

⸻

94. Email

Email should use the common communication API.

Do not create business-specific provider APIs such as:

/sendInvoiceViaSendGrid

Prefer:

POST /invoices/{invoiceId}/send

or:

POST /communications

Provider choice belongs to backend infrastructure.

⸻

95. SMS

Likewise, avoid:

/sendTwilioSMS

Prefer:

POST /communications

with:

{
  "channel": "sms"
}

This keeps providers replaceable.

⸻

96. File APIs

Potential:

POST   /files
GET    /files/{fileId}
DELETE /files/{fileId}

File access must be permission-aware.

⸻

97. File Upload

Depending on storage architecture, use either:

Client
↓
Backend Upload
↓
Object Storage

or:

Client
↓
Request Signed Upload
↓
Direct Object Storage Upload
↓
Confirm Upload

The latter may be preferable for larger files.

⸻

98. Signed Upload

Potential:

POST /files/upload-url

Request:

{
  "filename": "payment-proof.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245000
}

Backend validates before issuing temporary upload authorization.

⸻

99. File Attachment

Potential:

POST /files/{fileId}/attach

Request:

{
  "entityType": "payment",
  "entityId": "uuid",
  "purpose": "payment_proof"
}

Alternatively attachments may be established directly through domain APIs.

⸻

100. Notifications

GET /notifications

Possible:

?status=unread

Actions:

POST /notifications/{notificationId}/read
POST /notifications/read-all

⸻

101. Notification Count

Useful lightweight endpoint:

GET /notifications/unread-count

This avoids repeatedly loading all notifications merely to update the navigation badge.

⸻

102. Team APIs

GET    /teams
POST   /teams
GET    /teams/{teamId}
PATCH  /teams/{teamId}

Membership:

GET  /teams/{teamId}/members
POST /teams/{teamId}/members

Removal:

DELETE /teams/{teamId}/members/{userId}

⸻

103. User APIs

GET    /users
POST   /users
GET    /users/{userId}
PATCH  /users/{userId}

User creation may interact with the authentication provider.

Do not independently create mismatched application/authentication identities.

⸻

104. Roles

GET    /roles
POST   /roles
GET    /roles/{roleId}
PATCH  /roles/{roleId}

Role assignment:

POST   /users/{userId}/roles
DELETE /users/{userId}/roles/{roleId}

⸻

105. Permissions

GET /permissions

Role permission management:

GET /roles/{roleId}/permissions
PUT /roles/{roleId}/permissions

Replacing the complete permission set via PUT may be appropriate here if intentionally designed as full replacement.

⸻

106. Reports

Reports should use dedicated read endpoints.

Examples:

GET /reports/sales
GET /reports/leads
GET /reports/team-performance
GET /reports/inventory
GET /reports/purchases
GET /reports/billing
GET /reports/outstanding

Exact reporting dimensions come from REPORTS.md.

⸻

107. Report Filters

Common:

?dateFrom=
?dateTo=
?userId=
?teamId=
?customerId=
?productId=
?categoryId=
?brandId=
?warehouseId=

Do not accept irrelevant filters merely for consistency.

⸻

108. Dashboard

Use a purpose-built endpoint:

GET /dashboard

or role-specific query behavior.

Do not make the frontend call:

/leads
/invoices
/orders
/payments
/inventory
/follow-ups

and calculate all dashboard metrics client-side.

⸻

109. Dashboard Response

Conceptually:

{
  "data": {
    "leads": {},
    "sales": {},
    "followUps": {},
    "outstanding": {},
    "inventory": {}
  }
}

Return only metrics relevant to the authenticated user’s permissions.

⸻

110. Role-aware Dashboard

A salesperson may receive:

My Leads
My Follow-ups
My Sales

A manager may receive:

Team Pipeline
Team Performance
Sales
Outstanding

An administrator may receive broader operational metrics.

The API—not only the frontend—must enforce this scope.

⸻

111. Report Export

Small report:

GET /reports/sales/export?format=csv

Large report:

POST /report-exports

Response:

202 Accepted

Later:

GET /report-exports/{exportId}

⸻

112. Bulk Import APIs

Potential:

POST /imports

with:

entityType
fileId

Then:

GET /imports/{importId}

for status.

⸻

113. Import Preview

Recommended flow:

POST /imports/preview

then:

POST /imports

after user confirmation.

This is useful for:

* Leads
* Contacts
* Products
* Customers
* Suppliers
* Opening Stock

⸻

114. API Idempotency

Sensitive create/action APIs may accept:

Idempotency-Key

Examples:

POST /payments
POST /goods-receipts
POST /communications
POST /invoices/{id}/issue

This is particularly useful for mobile/network retry scenarios.

⸻

115. Mobile Retry Scenario

Example:

Mobile submits payment
↓
Network times out
↓
Mobile does not know whether request succeeded
↓
Mobile retries

Without idempotency:

Duplicate Payment

With idempotency:

Same Operation
→ Same Result

This is one reason to design idempotency before the mobile application exists.

⸻

116. Optimistic Concurrency

For highly editable records, the API may support:

version

Example update:

{
  "version": 4,
  "notes": "Updated requirement"
}

If database version is already 5:

409 Conflict

This prevents silent overwrites.

⸻

117. Conflict Response

Example:

{
  "error": {
    "code": "RESOURCE_MODIFIED",
    "message": "This record was modified by another user. Refresh and try again.",
    "requestId": "req_uuid"
  }
}

Use only where concurrency protection is relevant.

⸻

118. Bulk APIs

Avoid uncontrolled arrays containing thousands of operations.

For legitimate bulk workflows:

POST /leads/bulk-assign

may be acceptable.

Request:

{
  "leadIds": [
    "uuid1",
    "uuid2"
  ],
  "userId": "uuid"
}

Apply sensible maximum batch sizes.

⸻

119. Bulk Operation Permissions

Every item must still respect authorization.

Do not assume:

User can update one lead
=
User can update every supplied lead ID

⸻

120. Validation

All API input must be validated.

Validate:

Required fields
Types
Formats
Ranges
Enums
References
Permissions
Business rules

⸻

121. Phone Validation

Normalize phone numbers where practical.

Example canonical value:

+919876543210

Do not force clients to store display formatting as authoritative data.

⸻

122. Email Validation

Validate email syntax.

Normalize appropriately for matching.

Do not assume email uniqueness for customer contacts unless business rules require it.

⸻

123. Product Validation

Example product creation validation:

SKU required
SKU unique
Name required
Category valid
Brand valid
Unit valid
Tax rate valid

⸻

124. Inventory Validation

Example adjustment:

Product exists
Warehouse exists
Quantity valid
Reason required
User authorized
Result does not violate stock policy

⸻

125. Sales Validation

Quotation/order validation may include:

Customer valid
At least one item
Product active
Quantity > 0
Price valid
Discount permitted
Tax valid
Workflow state valid

⸻

126. Billing Validation

Invoice/payment validation may include:

Customer valid
Source order valid
Document state valid
Tax valid
Allocation valid
Currency valid
User authorized

Financial validation always occurs server-side.

⸻

127. Response DTOs

Do not return database entities blindly.

Use API response models/DTOs.

This prevents accidental exposure of:

* Internal fields
* Secret references
* Unnecessary metadata
* Database implementation details

⸻

128. List DTO vs Detail DTO

A lead list may return:

ID
Name
Company
Phone
Status
Owner
Next Follow-up
Created At

Lead detail may return much more.

Do not return full detail payloads in every list row.

⸻

129. Nested Resources

Keep nesting shallow.

Good:

/leads/{id}/activities

Avoid deeply nested URLs such as:

/companies/{companyId}/contacts/{contactId}/leads/{leadId}/activities/{activityId}

Use direct resource IDs when nesting becomes excessive.

⸻

130. Relationship Representation

Example:

{
  "customer": {
    "id": "uuid",
    "name": "ABC Electricals"
  }
}

may be useful for UI rendering.

Avoid embedding entire customer histories inside every invoice response.

⸻

131. Expand Pattern

Do not implement generic:

?expand=everything

initially.

Use purpose-built detail responses.

Generic expansion systems can create unpredictable query and performance problems.

⸻

132. N+1 Prevention

Backend API implementation must avoid N+1 database queries.

Especially:

/leads
/products
/sales-orders
/invoices
/reports

Inspect generated ORM queries where necessary.

⸻

133. API Performance

Target fast responses for normal operational APIs.

Operations expected to take significant time should become asynchronous.

Examples:

Large Export
Large Import
Complex PDF
Bulk Communication
Heavy Report

⸻

134. Async Job Pattern

POST /report-exports

Response:

{
  "data": {
    "id": "uuid",
    "status": "queued"
  }
}

Then:

GET /report-exports/{id}

Response eventually:

{
  "data": {
    "id": "uuid",
    "status": "completed",
    "fileId": "uuid"
  }
}

⸻

135. Job Status

Normalized statuses:

queued
processing
completed
failed
cancelled

where applicable.

⸻

136. Rate Limiting

Rate-limit sensitive endpoints.

Examples:

Login
Password Reset
Communication Send
Public/Integration Endpoints
Expensive Reports

Return:

429 Too Many Requests

when exceeded.

⸻

137. Integration Rate Limits

External providers may impose their own limits.

Communication APIs should queue work rather than attempting uncontrolled bursts.

⸻

138. CORS

Production API should allow only approved origins where browser CORS applies.

Do not use unrestricted CORS without a justified requirement.

⸻

139. API Security

All protected endpoints require:

HTTPS
+
Authentication
+
Authorization
+
Validation

depending on endpoint type.

⸻

140. Object-level Authorization

For:

GET /leads/{leadId}

do not only check:

Does user have lead.read?

also check:

Can user read THIS lead?

The same applies to:

* Customers
* Orders
* Invoices
* Payments
* Reports
* Files

⸻

141. Resource Not Found vs Forbidden

Where security requires avoiding resource enumeration, the API may return:

404

for inaccessible resources instead of revealing their existence.

Use this consistently.

⸻

142. File Security

File download authorization must validate access to the related business entity.

Knowing:

fileId

must not automatically grant file access.

⸻

143. Audit

Important API actions should generate audit events.

Examples:

Lead reassigned
Stock adjusted
PO approved
Sales order confirmed
Invoice issued
Payment recorded
Role changed

Audit creation should happen in the service/domain layer.

⸻

144. API Logging

Log:

Request ID
Method
Route
Status
Duration
User ID where appropriate

Do not log:

Passwords
Tokens
Secrets
Full sensitive payloads

⸻

145. API Metrics

Track:

Request Count
Latency
Error Rate
Status Codes
Slow Endpoints

Potential integration metrics:

Communication Queue Depth
Provider Failures
Webhook Failures

⸻

146. Health APIs

Potential:

GET /health

and internally:

GET /health/ready

depending on infrastructure.

Do not expose detailed database/provider credentials or internal diagnostics publicly.

⸻

147. API Documentation

Generate machine-readable API documentation where supported.

Recommended:

OpenAPI

API documentation should include:

* Endpoint
* Method
* Authentication
* Permissions
* Request Schema
* Response Schema
* Error Codes
* Filters
* Pagination
* Examples

⸻

148. OpenAPI

The implementation should maintain an OpenAPI specification generated from or synchronized with backend schemas.

Avoid documentation that becomes disconnected from actual implementation.

⸻

149. API Schema Reuse

Shared schemas should exist for concepts such as:

Pagination
Money
Address
User Summary
Company Summary
Product Summary
Error
File

Do not redefine them inconsistently in every endpoint.

⸻

150. Mobile API Readiness

The API must work without assumptions about:

Desktop browser
Large screen
Mouse
Browser-only state

Mobile should be able to call the same domain endpoints.

⸻

151. Mobile-focused Endpoints

Future mobile may particularly rely on:

GET /me
GET /me/follow-ups
GET /leads
GET /leads/{id}
POST /leads
POST /leads/{id}/activities
POST /leads/{id}/assign
POST /communications
GET /companies/{id}
GET /sales-orders
GET /invoices

No separate mobile backend is required initially.

⸻

152. Mobile Payload Efficiency

Mobile networks may be slower.

List endpoints should therefore:

* Paginate
* Avoid unnecessary nested data
* Avoid huge payloads
* Return compact summary DTOs

This benefits web performance as well.

⸻

153. Future Offline Mobile

If offline lead creation becomes a requirement, APIs may later support client-generated UUIDs and synchronization metadata.

Do not implement offline synchronization now.

Avoid architecture that prevents it.

⸻

154. API Backward Compatibility

Within /v1, prefer additive changes.

Usually safe:

Add optional response field
Add new endpoint
Add optional request parameter

Potentially breaking:

Rename field
Remove field
Change type
Change status meaning
Make optional field required

Breaking changes should be managed carefully.

⸻

155. API Version Upgrade

When genuinely incompatible changes accumulate:

/api/v2

may be introduced.

Do not create a new API version for every small enhancement.

⸻

156. Deprecation

If an endpoint is being replaced:

Old endpoint
↓
Deprecated
↓
Migration period
↓
Removed when safe

This becomes particularly important after mobile release.

⸻

157. Third-party API Access

If external systems later require API access, do not automatically expose the same authentication model used by employees.

Consider separate:

API Credentials
Scopes
Rate Limits
Audit

when that requirement actually arises.

⸻

158. Integration API Boundary

Internal API:

Business-oriented

External provider adapter:

Provider-oriented

Example:

Application says:

Send WhatsApp invoice

not:

Call Provider X endpoint Y with Provider X object Z

⸻

159. Provider Independence

Business APIs should survive provider replacement.

Example:

POST /communications

remains unchanged whether the underlying implementation later uses:

Provider A

or:

Provider B

⸻

160. Transaction Boundaries

The API route itself does not define the transaction.

The domain operation does.

Example:

POST /goods-receipts

must transactionally coordinate:

Receipt
+
Items
+
Stock Movement
+
Inventory Balance
+
PO State

⸻

161. API Anti-Patterns

Do NOT:

* Create /getLeads
* Create /createInvoice
* Use POST for every operation
* Create unversioned APIs
* Expose database tables directly
* Trust frontend totals
* Trust frontend permissions
* Return unlimited collections
* Return raw ORM entities
* Return stack traces
* Put provider credentials in responses
* Put critical workflow logic in controllers
* Update inventory through generic CRUD
* Update issued invoices casually
* Allow arbitrary status transitions
* Expose permanent public invoice URLs
* Make every external provider call synchronous
* Create separate APIs for web and mobile without reason
* Hardcode provider names into business endpoints
* Return enormous nested object graphs
* Build generic ?expand=everything
* Ignore duplicate requests
* Ignore concurrency
* Ignore object-level authorization
* Break /v1 casually after mobile release

⸻

162. Controller Rule

Controllers should remain thin.

Preferred:

Request
↓
Parse
↓
Validate
↓
Service
↓
Response

Not:

Controller
↓
500 lines of business logic
↓
Database
↓
Provider API

⸻

163. Service Rule

Services/domain operations should own:

* Business Rules
* Authorization Context
* Transactions
* Calculations
* Workflow Transitions
* Domain Events
* Audit Coordination
* Integration Requests

⸻

164. Repository Rule

Repositories/data-access code should own persistence concerns.

Do not scatter raw database queries throughout controllers.

Use optimized SQL where needed for reporting/performance, but keep ownership clear.

⸻

165. Claude API Instruction

Before creating or modifying an API, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read ARCHITECTURE.md.
4. Read DATABASE.md.
5. Read API.md.
6. Read the relevant module document.
7. Identify the business operation.
8. Identify required permission.
9. Identify data scope.
10. Define request validation.
11. Define response DTO.
12. Define error cases.
13. Identify transaction boundaries.
14. Consider concurrency.
15. Consider idempotency.
16. Consider audit requirements.
17. Consider mobile compatibility.
18. Consider pagination/filtering.
19. Update OpenAPI documentation.
20. Add appropriate tests.

⸻

166. Claude Endpoint Creation Rule

Do not create an endpoint simply because a screen needs data.

First determine whether an existing domain endpoint already represents the requirement.

Avoid:

/dashboardLeadWidgetData
/customerScreenHeaderData
/mobileLeadScreenData

unless there is a legitimate performance/use-case reason.

Prefer domain-oriented APIs.

⸻

167. Claude Financial API Rule

For:

Quotation
Sales Order
Purchase Order
Invoice
Payment

Claude must never trust client-computed financial values.

Backend must calculate/validate authoritative:

Subtotal
Discount
Tax
Total
Payment Allocation
Outstanding

using decimal arithmetic.

⸻

168. Claude Inventory API Rule

Claude must never create:

PATCH /inventory/{id}

to directly change stock quantity.

Inventory changes must happen through valid operations such as:

Goods Receipt
Sales Fulfilment
Adjustment
Return
Transfer

and generate traceable stock movements.

⸻

169. Claude Communication API Rule

Do not create separate provider-specific APIs throughout modules.

Use:

Communication Domain
↓
Provider Adapter

Business modules should request communication without knowing provider implementation details.

⸻

170. Claude Security Rule

Every endpoint must explicitly answer:

Is authentication required?
What permission is required?
What records can this user access?
What fields can this user change?
What happens if the supplied ID belongs to an inaccessible record?

Do not leave authorization as a frontend concern.

⸻

171. Claude List API Rule

Every potentially large collection should answer:

Is it paginated?
What is the default page size?
What is the maximum page size?
What can be filtered?
What can be searched?
What can be sorted?
What permission/data scope applies?

⸻

172. Claude Action API Rule

Before implementing:

POST /resource/{id}/action

determine:

Allowed starting states
Required permission
Validation
Transaction boundary
Audit event
Side effects
Notifications
Idempotency requirement
Resulting state

⸻

173. Recommended API Implementation Order

Implement APIs broadly in this sequence:

1. Foundation
   ├── Authentication
   ├── Me
   ├── Users
   ├── Teams
   ├── Roles
   └── Permissions
2. CRM
   ├── Leads
   ├── Lead Sources
   ├── Activities
   ├── Follow-ups
   ├── Contacts
   └── Companies
3. Product
   ├── Categories
   ├── Brands
   ├── Units
   └── Products
4. Inventory
   ├── Warehouses
   ├── Inventory
   ├── Stock Movements
   └── Adjustments
5. Sales
   ├── Quotations
   └── Sales Orders
6. Purchase
   ├── Purchase Orders
   └── Goods Receipts
7. Billing
   ├── Invoices
   └── Payments
8. Communication
   ├── Communications
   ├── Templates
   └── Webhooks
9. Platform
   ├── Files
   ├── Notifications
   └── Settings
10. Reporting
    ├── Dashboard
    ├── Reports
    └── Exports

Do not implement every API at once.

⸻

174. Initial API Priority

The first operational vertical slice should prioritize:

Authentication
↓
User / Permission Context
↓
Lead
↓
Lead Assignment
↓
Lead Activity
↓
Follow-up
↓
Company / Contact

This delivers the project’s primary CRM/team-tracking value before moving into the heavier commercial modules.

⸻

175. API Testing

Each endpoint should have appropriate tests for:

Successful Request
Invalid Input
Unauthenticated Request
Unauthorized Request
Resource Not Found
Invalid Business State
Important Edge Cases

Critical financial/inventory APIs require deeper integration testing.

⸻

176. Contract Tests

Important response schemas should be tested so frontend/mobile clients do not receive accidental breaking changes.

This becomes increasingly important once the mobile application exists.

⸻

177. Integration Testing

Critical API flows should eventually test:

Lead Creation
↓
Lead Assignment
↓
Lead Conversion
Quotation
↓
Sales Order
Purchase Order
↓
Goods Receipt
↓
Inventory
Sales Order
↓
Invoice
↓
Payment
Invoice
↓
Communication
↓
Provider Status

⸻

178. API Success Criteria

The API architecture succeeds when:

* Web can use it without direct database access.
* Future mobile can use the same backend.
* Permissions are enforced server-side.
* Team data scope is respected.
* Collections remain performant as data grows.
* Financial calculations remain authoritative.
* Inventory cannot be arbitrarily manipulated.
* Business workflow transitions are explicit.
* Communication providers remain replaceable.
* Third-party failures do not corrupt business data.
* Duplicate network requests can be safely handled where necessary.
* API errors are predictable.
* APIs remain understandable to new developers.
* OpenAPI documentation reflects actual behavior.
* Older mobile versions can be supported without constant breakage.

⸻

179. Final API Principle

The API should represent:

Business Capabilities

not:

Database Tables

and not:

Individual UI Screens

The architectural relationship is:

                Web Application
                      │
                      ▼
                 /api/v1
                      ▲
                      │
              Future Mobile App
                      │
                      ▼
              Business Services
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    PostgreSQL      Queue        Storage
                      │
                      ▼
               Integrations
             ┌──────┼──────┐
             ▼      ▼      ▼
         WhatsApp  Email   SMS

The key API rules are:

Authentication
+
Authorization
+
Validation
+
Business Logic
+
Transactions
+
Consistent Responses
+
Pagination
+
Idempotency where needed
+
Auditability

The API must remain the stable contract between the business platform and its clients.

The web application is the first client.

The mobile application will become another client.

Third-party integrations remain behind controlled service boundaries.

This allows the CRM to evolve without rebuilding the core platform every time a new interface or communication provider is introduced.