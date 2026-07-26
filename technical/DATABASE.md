DATABASE.md

Electrical Distribution CRM — Database Design Specification

Version: 1.0
Status: Technical Database Specification
Category: Technical
Parent Document: PROJECT.md
Related Documents: PROJECT_SETUP.md, ARCHITECTURE.md, API.md, CRM.md, SALES.md, INVENTORY.md, PURCHASE.md, BILLING.md, REPORTS.md

⸻

1. Purpose

This document defines the database architecture and logical data model for the Electrical Distribution CRM.

The database must support:

* Authentication
* Users
* Teams
* Roles & Permissions
* Leads
* Contacts
* Companies
* Customers
* Suppliers
* Lead Activities
* Follow-ups
* Sales Pipeline
* Quotations
* Sales Orders
* Products
* Product Categories
* Brands
* Warehouses
* Inventory
* Stock Movements
* Purchase Orders
* Goods Receipts
* Invoices
* Payments
* WhatsApp
* Email
* SMS
* Communication History
* Notifications
* Files
* Audit Logs
* Reports
* Future Mobile Application

The database is the authoritative transactional data store for the application.

⸻

2. Database Technology

Recommended database:

PostgreSQL

PostgreSQL should be used because the application requires:

* Strong relational integrity
* Transactions
* Financial accuracy
* Inventory consistency
* Complex reporting
* Indexing
* JSON support where appropriate
* Reliable concurrent operations
* Mature backup and recovery tooling

⸻

3. Database Design Principles

The database should follow:

1. Relational integrity
2. Clear ownership of data
3. Normalization where practical
4. Controlled denormalization only when justified
5. Immutable historical records where required
6. Financial accuracy
7. Inventory traceability
8. Auditability
9. Mobile-safe identifiers
10. Efficient indexing
11. Transactional consistency
12. Soft deletion / archival where appropriate
13. Controlled status values
14. Timestamp consistency
15. No unnecessary duplication

⸻

4. Database Domain Structure

Conceptually:

Database
│
├── Identity
│   ├── users
│   ├── teams
│   ├── roles
│   ├── permissions
│   ├── user_roles
│   └── role_permissions
│
├── CRM
│   ├── leads
│   ├── lead_sources
│   ├── lead_activities
│   ├── follow_ups
│   ├── contacts
│   ├── companies
│   └── addresses
│
├── Sales
│   ├── quotations
│   ├── quotation_items
│   ├── sales_orders
│   └── sales_order_items
│
├── Products
│   ├── products
│   ├── product_categories
│   ├── brands
│   └── units
│
├── Inventory
│   ├── warehouses
│   ├── inventory_balances
│   └── stock_movements
│
├── Purchase
│   ├── suppliers
│   ├── purchase_orders
│   ├── purchase_order_items
│   ├── goods_receipts
│   └── goods_receipt_items
│
├── Billing
│   ├── invoices
│   ├── invoice_items
│   ├── payments
│   └── payment_allocations
│
├── Communication
│   ├── communications
│   ├── communication_templates
│   └── communication_events
│
├── Platform
│   ├── files
│   ├── notifications
│   ├── audit_logs
│   ├── document_sequences
│   └── application_settings
│
└── Reporting
    └── Views / Materialized Views where justified

Exact physical naming may follow ORM conventions defined during implementation.

⸻

5. Identifier Strategy

Every primary business entity should have a stable system identifier.

Recommended:

UUID

or another non-sequential globally unique identifier supported by the selected implementation stack.

Example:

id = UUID

Benefits:

* Safe API exposure
* Mobile compatibility
* Easier distributed generation
* Reduced dependence on database sequence IDs
* Easier future data migration

⸻

6. Internal ID vs Business Number

System IDs and business document numbers are different.

Example:

Invoice
id
→ 3e5a... UUID
invoice_number
→ INV/HYD/2026-27/001245

Never use:

invoice_number

as the database primary key.

The same applies to:

* Quotation Number
* Sales Order Number
* Purchase Order Number
* Invoice Number
* Receipt Number

⸻

7. Common Columns

Most primary entities should include:

id
created_at
updated_at

Where relevant:

created_by
updated_by
archived_at
archived_by

Do not mechanically add soft-delete columns to every join/reference table.

⸻

8. Timestamp Standard

Application timestamps should be stored as timezone-aware values.

Recommended:

TIMESTAMPTZ

Store operational timestamps consistently in UTC.

Convert them to business/user timezone at presentation boundaries.

Examples:

created_at
updated_at
sent_at
delivered_at
paid_at
received_at

⸻

9. Business Dates

Fields that represent business dates rather than moments in time should use:

DATE

Examples:

invoice_date
due_date
quotation_date
order_date
po_date
expected_delivery_date

Do not use timestamps where time-of-day has no business meaning.

⸻

10. Money

Never use floating-point types for money.

Use:

NUMERIC / DECIMAL

with an agreed precision and scale.

Examples:

unit_price
subtotal
discount_amount
tax_amount
total_amount
payment_amount
outstanding_amount

⸻

11. Currency

Documents should store currency explicitly where appropriate.

Example:

currency_code = INR

Use ISO currency codes.

Display formatting for the initial application follows:

Locale: en-IN
Currency: INR

Example:

₹12,50,000.00

Do not infer currency permanently from UI locale.

⸻

12. Percentage Values

Percentages should use decimal/numeric values.

Examples:

discount_percentage
tax_rate

Avoid storing:

"18%"

as text.

⸻

13. Boolean Values

Use actual Boolean fields for binary values.

Examples:

is_active
is_default
is_read

Do not use:

"yes"
"no"

strings.

⸻

14. Controlled Status Values

Important workflow statuses should use controlled enumerations or validated status values.

Do not permit arbitrary strings.

Examples:

lead_status
quotation_status
sales_order_status
purchase_order_status
invoice_status
payment_status
communication_status

Exact states come from respective module documents.

⸻

15. User

Table

users

Conceptual fields:

id
first_name
last_name
email
phone
auth_provider_id
status
last_login_at
created_at
updated_at
archived_at

If authentication is handled externally, credentials should not be duplicated unnecessarily.

⸻

16. User Email

User email should normally have a uniqueness constraint where it serves as login identity.

Normalize email for comparison.

Do not rely only on frontend duplicate checks.

⸻

17. Team

Table

teams

Conceptual fields:

id
name
description
manager_id
is_active
created_at
updated_at

Example teams:

Hyderabad Sales
Inside Sales
Field Sales

Team structure should remain simple unless business requirements require hierarchy.

⸻

18. Team Membership

If users may belong to multiple teams, use:

team_members

Fields:

id
team_id
user_id
membership_role
joined_at
is_active

If requirements confirm one team per user, this may be simplified.

Do not prematurely hardcode a limitation without checking team requirements.

⸻

19. Roles

Table

roles

Fields:

id
name
description
is_system_role
created_at
updated_at

Possible examples:

Administrator
Sales Manager
Sales Executive
Inventory Manager
Purchase Manager
Billing User

Exact roles should remain configurable where practical.

⸻

20. Permissions

Table

permissions

Fields:

id
code
name
description
module

Example:

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

Permission codes should be stable.

⸻

21. User Roles

Table

user_roles

Fields:

user_id
role_id

Use a composite uniqueness constraint:

UNIQUE(user_id, role_id)

⸻

22. Role Permissions

Table

role_permissions

Fields:

role_id
permission_id

Use:

UNIQUE(role_id, permission_id)

⸻

23. CRM Entity Model

Core CRM relationships:

Lead
 │
 ├── Activities
 ├── Follow-ups
 ├── Communications
 └── Conversion
        │
        ├── Contact
        └── Company / Customer

Lead history should not disappear after conversion.

⸻

24. Lead

Table

leads

Conceptual fields:

id
first_name
last_name
company_name
phone
alternate_phone
email
source_id
status
priority
assigned_to
assigned_team_id
estimated_value
currency_code
notes
next_follow_up_at
converted_at
converted_contact_id
converted_company_id
created_by
created_at
updated_at
archived_at

Exact fields must follow CRM.md.

⸻

25. Lead Source

Table

lead_sources

Fields:

id
name
description
is_active
created_at
updated_at

Examples:

Website
Referral
Walk-in
Phone
WhatsApp
Existing Customer
Sales Visit

Do not store arbitrary lead-source strings repeatedly in leads.

⸻

26. Lead Assignment

Use foreign keys:

assigned_to
→ users.id
assigned_team_id
→ teams.id

Assignment changes should also create audit/activity records where required.

⸻

27. Lead Conversion

Do not delete a lead when converted.

Instead:

lead.status = converted
converted_at = ...
converted_contact_id = ...
converted_company_id = ...

This preserves:

* Lead Source
* Sales Attribution
* Activities
* Communication History
* Conversion Reporting

⸻

28. Lead Activity

Table

lead_activities

Conceptual fields:

id
lead_id
activity_type
title
description
performed_by
activity_at
metadata
created_at

Possible activity types:

created
assigned
status_changed
call
meeting
note
follow_up
quotation_created
converted

Do not put all lead history into a single free-text notes field.

⸻

29. Follow-up

Table

follow_ups

Fields:

id
lead_id
contact_id
company_id
assigned_to
follow_up_type
scheduled_at
status
notes
completed_at
created_by
created_at
updated_at

At least one relevant CRM entity relationship should exist.

⸻

30. Follow-up Status

Conceptually:

pending
completed
cancelled
overdue

Overdue may be derived rather than persisted.

Do not update thousands of rows unnecessarily if status can be safely calculated from:

scheduled_at
+
completion state

⸻

31. Contact

Table

contacts

Conceptual fields:

id
first_name
last_name
job_title
phone
alternate_phone
email
company_id
is_primary
owner_id
created_by
created_at
updated_at
archived_at

A contact represents a person.

⸻

32. Company

Table

companies

Conceptual fields:

id
name
company_type
phone
email
website
gstin
tax_identifier
owner_id
credit_limit
payment_terms_days
is_customer
is_supplier
is_active
created_by
created_at
updated_at
archived_at

Company type may represent:

* Dealer
* Distributor
* Retailer
* Contractor
* Builder
* Business Customer

Exact classifications belong to CRM/business requirements.

⸻

33. Customer and Supplier Modeling

Avoid unnecessary duplicate entities.

A company may potentially be:

Customer
Supplier
Both

Therefore customer/supplier role information should be modeled carefully.

If customer-specific or supplier-specific fields become substantial, use profile tables.

Example:

companies
    │
    ├── customer_profiles
    └── supplier_profiles

rather than duplicating the company itself.

⸻

34. Customer Profile

Optional table:

customer_profiles

Fields may include:

company_id
customer_code
credit_limit
payment_terms_days
price_list_id
customer_since

Create this only if customer-specific attributes justify it.

⸻

35. Supplier Profile

Potential table:

supplier_profiles

Fields:

company_id
supplier_code
payment_terms_days
supplier_since
notes

The exact supplier model should follow PURCHASE.md.

⸻

36. Address

Table

addresses

Conceptual fields:

id
entity_type
entity_id
address_type
line1
line2
city
state
postal_code
country_code
is_default
created_at
updated_at

However, polymorphic foreign keys cannot enforce ordinary relational foreign-key integrity.

Where strong integrity is preferred, use dedicated relationship tables such as:

company_addresses
contact_addresses
warehouse_addresses

or explicit foreign keys.

The final implementation should favor relational integrity over convenience.

⸻

37. Address Types

Potential:

billing
shipping
office
warehouse
other

Do not assume billing and shipping addresses are always identical.

⸻

38. Product Domain

Core:

Category
   │
Product ─── Brand
   │
   └────── Unit

Product is shared across:

* Sales
* Inventory
* Purchase
* Billing

⸻

39. Product Category

Table

product_categories

Fields:

id
name
parent_id
description
is_active
created_at
updated_at

Examples:

Lights
Fans
Wires
Switches

Optional hierarchy:

Lights
├── LED Bulbs
├── Panel Lights
└── Downlights

Do not create category hierarchy unless the business needs it.

⸻

40. Brand

Table

brands

Fields:

id
name
description
is_active
created_at
updated_at

Examples might include manufacturer brands handled by the distributor.

⸻

41. Unit

Table

units

Fields:

id
name
symbol
decimal_allowed
is_active

Examples:

Piece     pcs
Box       box
Coil      coil
Meter     m
Roll      roll

Do not hardcode all quantities as “pieces”.

⸻

42. Product

Table

products

Conceptual fields:

id
sku
name
description
category_id
brand_id
unit_id
hsn_code
tax_rate
purchase_price_reference
selling_price_reference
minimum_stock_level
is_active
created_by
created_at
updated_at
archived_at

Price fields here are references/defaults.

Actual commercial documents must snapshot prices.

⸻

43. SKU

sku should normally be unique.

Example:

FAN-REN-1200-WHT

Do not use product name as a unique identifier.

⸻

44. Product Pricing

Do not assume one permanent price is sufficient.

The initial product table may contain default/reference prices.

Actual prices belong on document line items:

quotation_items.unit_price
sales_order_items.unit_price
invoice_items.unit_price
purchase_order_items.unit_price

This preserves historical pricing.

⸻

45. Future Price Lists

If pricing complexity grows, introduce:

price_lists
price_list_items

for:

* Dealer Pricing
* Retail Pricing
* Customer-specific Pricing
* Regional Pricing

Do not implement this until requirements justify it.

⸻

46. Warehouse

Table

warehouses

Fields:

id
code
name
address_id
manager_id
is_active
created_at
updated_at

Even if the business initially uses one warehouse, the model should not unnecessarily prevent multiple warehouses.

⸻

47. Inventory Principle

Inventory must be traceable.

The core principle is:

Stock Movement Ledger
+
Current Balance

The ledger explains why stock changed.

The balance provides fast current-state access.

⸻

48. Stock Movement

Table

stock_movements

Conceptual fields:

id
product_id
warehouse_id
movement_type
quantity
unit_cost
reference_type
reference_id
movement_at
notes
created_by
created_at

Possible movement types:

opening
purchase_receipt
sales_issue
sales_return
purchase_return
adjustment_in
adjustment_out
transfer_in
transfer_out
reservation
reservation_release

Only implement types required by INVENTORY.md.

⸻

49. Stock Quantity Direction

Choose one consistent approach.

Recommended:

quantity_delta

where:

+10 = stock increased
-5  = stock decreased

Alternatively store movement direction separately.

Do not mix conventions.

⸻

50. Inventory Balance

Table

inventory_balances

Fields:

product_id
warehouse_id
on_hand_quantity
reserved_quantity
updated_at

Constraint:

UNIQUE(product_id, warehouse_id)

Available stock can usually be derived:

available_quantity
=
on_hand_quantity - reserved_quantity

Do not maintain independently mutable copies without a reason.

⸻

51. Inventory Balance Integrity

Changes to:

inventory_balances

must occur through inventory domain operations.

Do not permit arbitrary CRUD updates to stock balances.

Every legitimate stock change should correspond to a traceable movement.

⸻

52. Negative Stock

Whether negative stock is permitted must be defined by INVENTORY.md.

If prohibited:

available stock

must be validated transactionally before stock-consuming operations.

Do not rely on the UI’s previously loaded quantity.

⸻

53. Inventory Concurrency

Stock operations must account for concurrent users.

Example:

Available = 10
User A attempts 8
User B attempts 5

Both cannot succeed if negative stock is prohibited.

Use appropriate database transactions/locking strategy.

⸻

54. Sales Data Model

Core:

Lead / Customer
       │
       ▼
   Quotation
       │
       ▼
  Sales Order
       │
       ▼
    Invoice
       │
       ▼
    Payment

Not every workflow must originate from a lead.

Existing customers may create orders directly where business rules allow.

⸻

55. Quotation

Table

quotations

Conceptual fields:

id
quotation_number
customer_company_id
contact_id
lead_id
quotation_date
valid_until
status
currency_code
subtotal
discount_amount
tax_amount
total_amount
billing_address_snapshot
shipping_address_snapshot
notes
terms
owner_id
created_by
created_at
updated_at

Exact status flow comes from SALES.md.

⸻

56. Quotation Item

Table

quotation_items

Fields:

id
quotation_id
product_id
sku_snapshot
product_name_snapshot
description_snapshot
hsn_snapshot
unit_snapshot
quantity
unit_price
discount_percentage
discount_amount
tax_rate
tax_amount
line_total
sort_order
created_at

Snapshots preserve historical document integrity.

⸻

57. Why Item Snapshots Matter

Suppose:

Product Name today:
Atomberg Renesa 1200mm White

Later it is renamed.

An old quotation should not silently change.

Therefore document items preserve the commercial description used at issuance.

⸻

58. Sales Order

Table

sales_orders

Conceptual fields:

id
sales_order_number
quotation_id
customer_company_id
contact_id
order_date
expected_delivery_date
status
currency_code
subtotal
discount_amount
tax_amount
total_amount
billing_address_snapshot
shipping_address_snapshot
owner_id
notes
terms
created_by
created_at
updated_at
confirmed_at
completed_at
cancelled_at

⸻

59. Sales Order Item

Table

sales_order_items

Fields:

id
sales_order_id
product_id
quotation_item_id
sku_snapshot
product_name_snapshot
description_snapshot
hsn_snapshot
unit_snapshot
quantity
unit_price
discount_percentage
discount_amount
tax_rate
tax_amount
line_total
fulfilled_quantity
created_at

Do not derive historical order pricing from the current product master.

⸻

60. Quotation → Sales Order

Store explicit relationship:

sales_orders.quotation_id

where an order originates from a quotation.

Do not infer relationships by customer/date/value matching.

⸻

61. Purchase Domain

Core:

Supplier
   │
   ▼
Purchase Order
   │
   ▼
Goods Receipt
   │
   ▼
Stock Movement

⸻

62. Purchase Order

Table

purchase_orders

Conceptual fields:

id
po_number
supplier_company_id
po_date
expected_delivery_date
status
currency_code
subtotal
discount_amount
tax_amount
total_amount
shipping_address_snapshot
supplier_address_snapshot
notes
terms
created_by
approved_by
approved_at
created_at
updated_at

Exact status workflow comes from PURCHASE.md.

⸻

63. Purchase Order Item

Table

purchase_order_items

Fields:

id
purchase_order_id
product_id
sku_snapshot
product_name_snapshot
description_snapshot
hsn_snapshot
unit_snapshot
ordered_quantity
received_quantity
unit_price
discount_percentage
discount_amount
tax_rate
tax_amount
line_total
created_at

⸻

64. Goods Receipt

Table

goods_receipts

Fields:

id
receipt_number
purchase_order_id
warehouse_id
receipt_date
supplier_document_number
notes
received_by
created_at

A purchase order may have multiple goods receipts.

⸻

65. Goods Receipt Item

Table

goods_receipt_items

Fields:

id
goods_receipt_id
purchase_order_item_id
product_id
quantity_received
accepted_quantity
rejected_quantity
unit_cost
created_at

Only include accepted/rejected separation if required by purchase workflows.

⸻

66. Goods Receipt Transaction

Recording a receipt should transactionally create:

Goods Receipt
+
Goods Receipt Items
+
Purchase Item Received Quantities
+
Stock Movements
+
Inventory Balance Updates
+
PO State Recalculation

If one critical step fails, the transaction should roll back.

⸻

67. Partial Receipt

Support:

Ordered: 100
Received: 40
Remaining: 60

Do not model a purchase order as simply:

received = true / false

if partial deliveries are supported.

⸻

68. Billing Domain

Core:

Customer
   │
   ▼
Invoice
   │
   ▼
Payment Allocation
   ▲
   │
Payment

Payment and invoice are separate concepts.

⸻

69. Invoice

Table

invoices

Conceptual fields:

id
invoice_number
sales_order_id
customer_company_id
contact_id
invoice_date
due_date
status
currency_code
subtotal
discount_amount
taxable_amount
cgst_amount
sgst_amount
igst_amount
tax_amount
total_amount
paid_amount
outstanding_amount
billing_address_snapshot
shipping_address_snapshot
customer_name_snapshot
customer_gstin_snapshot
notes
terms
issued_at
created_by
created_at
updated_at

Tax structure should match BILLING.md.

⸻

70. Invoice Item

Table

invoice_items

Fields:

id
invoice_id
sales_order_item_id
product_id
sku_snapshot
product_name_snapshot
description_snapshot
hsn_snapshot
unit_snapshot
quantity
unit_price
discount_percentage
discount_amount
taxable_amount
tax_rate
cgst_rate
cgst_amount
sgst_rate
sgst_amount
igst_rate
igst_amount
tax_amount
line_total
created_at

Do not depend on the current product tax rate for historical invoices.

⸻

71. Invoice Snapshot Principle

Once an invoice is issued, relevant commercial values should not silently change because master data changed.

Preserve:

* Customer Name
* GSTIN
* Address
* Product Description
* HSN
* Quantity
* Price
* Discount
* Tax Rates
* Tax Amounts

This is essential for reliable billing history.

⸻

72. Draft vs Issued Invoice

Draft invoices may be editable according to BILLING.md.

Issued invoices should be treated as substantially more immutable.

Do not casually update issued financial documents.

Corrections should follow defined financial workflows.

⸻

73. Payment

Table

payments

Conceptual fields:

id
payment_number
customer_company_id
payment_date
amount
currency_code
payment_method
reference_number
status
notes
received_by
created_by
created_at
updated_at

A payment does not necessarily belong directly to only one invoice.

⸻

74. Payment Allocation

Table

payment_allocations

Fields:

id
payment_id
invoice_id
allocated_amount
created_at

This allows:

One Payment
→ Multiple Invoices

and:

One Invoice
→ Multiple Payments

⸻

75. Payment Relationship

Conceptually:

Payment A
 ├── ₹30,000 → Invoice 1
 └── ₹20,000 → Invoice 2

and:

Invoice 3
 ├── Payment X → ₹25,000
 └── Payment Y → ₹15,000

This is more flexible and accurate than storing one payment_id on an invoice.

⸻

76. Outstanding Amount

Conceptually:

Outstanding
=
Invoice Total
-
Valid Payment Allocations
-
Applicable Credits

if credits are supported.

The backend owns this calculation.

If outstanding_amount is persisted for performance, it must be maintained transactionally.

⸻

77. Payment Transaction

Recording a payment allocation should occur transactionally.

Example:

Create Payment
+
Create Allocation(s)
+
Recalculate Invoice Paid Amount(s)
+
Recalculate Outstanding Amount(s)
+
Recalculate Invoice Status(es)

Avoid partially updated financial state.

⸻

78. Payment Attachments

Payment proof should use the shared file system.

Do not store binary receipt images in:

payments

Store file relationships instead.

⸻

79. Document Sequences

Table

document_sequences

Conceptual fields:

id
document_type
prefix
financial_year
location_code
current_number
updated_at

Potential document types:

quotation
sales_order
purchase_order
goods_receipt
invoice
payment

⸻

80. Document Number Generation

Number generation must be concurrency-safe.

Example:

INV/HYD/2026-27/001245

Generation must occur using transactional sequence logic.

Never use:

COUNT(*) + 1

⸻

81. Financial Year

Because the business is initially Indian, document numbering may need financial-year awareness.

Example:

2026-27

Do not hardcode this directly throughout application code.

Use centralized numbering logic.

⸻

82. Communication Domain

Communication relationships:

Lead
Contact
Company
Invoice
Quotation
Sales Order
Purchase Order
        │
        ▼
Communication
        │
        ├── WhatsApp
        ├── Email
        └── SMS

Communication should be stored centrally.

⸻

83. Communication

Table

communications

Conceptual fields:

id
channel
direction
status
sender
recipient
subject
message_body
template_id
provider
provider_message_id
related_entity_type
related_entity_id
created_by
queued_at
sent_at
delivered_at
read_at
failed_at
failure_reason
created_at
updated_at

⸻

84. Communication Channel

Controlled values:

whatsapp
email
sms

Future channels may be introduced without changing unrelated domain records.

⸻

85. Communication Direction

Values:

outbound
inbound

Even if the first implementation is outbound-focused, the model should not unnecessarily block future inbound communication history.

⸻

86. Communication Status

Potential normalized states:

draft
queued
sending
sent
delivered
read
failed

Not every channel supports every state.

Provider-specific statuses should map to internal statuses.

⸻

87. Communication Relationship

A communication may relate to a:

lead
contact
company
quotation
sales_order
invoice
purchase_order

Polymorphic association may be practical here because communications can relate to many entity types.

If used, application-level integrity must be carefully enforced.

Alternative explicit relationship tables may be introduced if stronger FK integrity becomes necessary.

⸻

88. Communication Template

Table

communication_templates

Fields:

id
name
channel
purpose
subject_template
body_template
provider_template_id
language_code
status
created_by
created_at
updated_at

⸻

89. Template Variables

Template variables should use controlled placeholders.

Example:

{{customer_name}}
{{invoice_number}}
{{invoice_total}}
{{due_date}}

Do not store executable code in templates.

⸻

90. Communication Event

Table

communication_events

Fields:

id
communication_id
provider_event_id
event_type
provider_status
event_at
payload
created_at

Use this to retain provider delivery/webhook history where valuable.

⸻

91. Webhook Idempotency

provider_event_id should be unique where providers supply reliable unique event identifiers.

This prevents processing the same webhook multiple times.

⸻

92. Raw Provider Payload

JSON may be stored for provider event debugging where appropriate.

Do not treat raw payload as authoritative business state.

Normalize important values into structured columns.

Sensitive data should not be stored unnecessarily.

⸻

93. Files

Table

files

Conceptual fields:

id
storage_provider
storage_key
original_filename
mime_type
size_bytes
checksum
uploaded_by
created_at
deleted_at

Binary data belongs in object storage.

⸻

94. File Relationship

Because files can belong to many entity types, use either:

file_links

with:

file_id
entity_type
entity_id
purpose

or dedicated relationship tables for high-integrity domains.

This allows one file to be attached to different supported records where appropriate.

⸻

95. File Purposes

Examples:

customer_document
quotation_attachment
po_attachment
invoice_pdf
payment_proof
communication_attachment
product_document

Use controlled values.

⸻

96. Generated Documents

Generated PDFs should retain:

file record
+
related business document
+
generation timestamp

If a document is regenerated, consider whether versions must be preserved.

Issued financial documents should not silently point to an unrelated regenerated representation.

⸻

97. Notification

Table

notifications

Fields:

id
user_id
type
title
message
related_entity_type
related_entity_id
is_read
read_at
created_at

Examples:

Lead assigned
Follow-up due
Invoice overdue
PO approved

⸻

98. Notification Indexing

Common query:

WHERE user_id = ?
AND is_read = false
ORDER BY created_at DESC

Index accordingly.

⸻

99. Audit Log

Table

audit_logs

Conceptual fields:

id
actor_user_id
action
entity_type
entity_id
before_data
after_data
metadata
request_id
ip_address
user_agent
created_at

Use JSON fields for snapshots where appropriate.

⸻

100. Audit Scope

Audit important operations such as:

* Lead Assignment
* Lead Status Changes
* Sales Order Approval
* Price Overrides
* Stock Adjustments
* Purchase Approval
* Invoice Issue
* Payment Recording
* Payment Changes
* Role Changes
* Permission Changes

Do not audit every harmless page view unless a requirement demands it.

⸻

101. Audit Immutability

Audit logs should not be editable through normal application CRUD.

They represent historical evidence.

Deletion should be tightly controlled by retention/security policies.

⸻

102. Activity vs Audit

These are different.

Activity
→ User-facing business timeline

Example:

Rahul called customer.
Audit
→ System-level traceability

Example:

Lead owner changed from User A to User B.

Do not force both purposes into one table.

⸻

103. Application Settings

Table

application_settings

Potential fields:

key
value
data_type
description
updated_by
updated_at

Use only for genuine configurable application behavior.

Do not store secrets here unless values are properly encrypted and architecture explicitly supports it.

⸻

104. Integration Configuration

Third-party provider configuration may require:

integration_connections

Conceptual fields:

id
integration_type
provider
display_name
status
configuration_metadata
credential_reference
created_by
created_at
updated_at

Secrets should preferably live in secret-management infrastructure.

The database should store references/configuration rather than plaintext credentials.

⸻

105. Report Data

Do not create separate duplicated report tables initially.

Reports should query authoritative transactional tables.

Use:

SQL Views

where repeated query structures benefit.

Use:

Materialized Views

only when performance justifies them.

⸻

106. Reporting Views

Potential future views:

sales_summary_view
lead_conversion_view
team_performance_view
inventory_summary_view
purchase_summary_view
invoice_outstanding_view

These are read models, not sources of truth.

⸻

107. Dashboard Aggregation

Dashboard queries should be optimized using:

* Appropriate indexes
* Purpose-built SQL
* Views where useful
* Limited date ranges
* Controlled joins

Do not create dozens of redundant summary tables initially.

⸻

108. Index Strategy

Indexes should reflect real query patterns.

Potential indexes:

leads(status)
leads(assigned_to)
leads(created_at)
leads(next_follow_up_at)
contacts(phone)
contacts(email)
companies(name)
companies(gstin)
products(sku)
products(name)
products(category_id)
products(brand_id)
stock_movements(product_id, warehouse_id, movement_at)
quotations(customer_company_id)
quotations(status)
quotations(quotation_date)
sales_orders(customer_company_id)
sales_orders(status)
sales_orders(order_date)
purchase_orders(supplier_company_id)
purchase_orders(status)
invoices(customer_company_id)
invoices(status)
invoices(invoice_date)
invoices(due_date)
payments(customer_company_id)
payments(payment_date)
communications(recipient)
communications(status)
communications(created_at)

Do not add indexes blindly.

⸻

109. Composite Indexes

Use composite indexes when common queries filter/sort by multiple columns.

Example:

leads(assigned_to, status, created_at)

may help:

My Open Leads

But actual indexes should be validated against query plans.

⸻

110. Unique Constraints

Potential uniqueness requirements:

users.email
products.sku
quotations.quotation_number
sales_orders.sales_order_number
purchase_orders.po_number
goods_receipts.receipt_number
invoices.invoice_number
payments.payment_number

Scope may vary if future multi-organization support is introduced.

⸻

111. Foreign Keys

Use foreign keys for important relationships.

Examples:

quotation_items.quotation_id
→ quotations.id
sales_order_items.sales_order_id
→ sales_orders.id
purchase_order_items.purchase_order_id
→ purchase_orders.id
invoice_items.invoice_id
→ invoices.id
payment_allocations.payment_id
→ payments.id
payment_allocations.invoice_id
→ invoices.id

Do not rely solely on application code to maintain these relationships.

⸻

112. Delete Behavior

Choose delete behavior deliberately.

Avoid indiscriminate:

ON DELETE CASCADE

for business records.

For example, deleting a customer must not automatically delete:

* Invoices
* Payments
* Orders

Historical business data must remain intact.

⸻

113. Cascade Use

Cascade may be reasonable for tightly owned child records before document issuance.

Example:

Draft Quotation
→ Draft Quotation Items

Even then, behavior should be deliberate.

Financial and audit records require stricter treatment.

⸻

114. Archive Strategy

Master records such as:

Customer
Supplier
Product
User

should generally support archival/inactivation.

Example:

archived_at

or:

is_active

Use semantics consistently.

⸻

115. Archive vs Active

These concepts are not always identical.

is_active

may mean:

Can this record be used for new transactions?

while:

archived_at

may mean:

Has this record been removed from normal operational views?

Do not introduce both unless the distinction is needed.

⸻

116. Historical References

Archived master data must remain resolvable from historical documents.

Example:

An archived product may still appear on an invoice from last year.

Do not break foreign-key relationships simply because a master record is inactive.

⸻

117. Nullability

Use NOT NULL for fields genuinely required by the data model.

Do not mark every field nullable for development convenience.

At the same time, avoid requiring optional CRM data that may not exist.

Example:

A lead may have:

phone

but no email.

Business validation may require at least one contact method without requiring both columns individually.

⸻

118. Database Constraints

Use constraints for structural truths.

Examples:

quantity > 0
allocated_amount > 0
total_amount >= 0

where business rules guarantee them.

Do not encode highly complex workflow logic entirely as database constraints if it belongs to the domain layer.

⸻

119. Quantity Precision

Some products may use fractional units.

Example:

Wire sold by meter

Therefore quantity fields should not automatically be integer-only.

Use an appropriate numeric type if fractional quantities are supported.

Unit configuration can indicate whether decimals are allowed.

⸻

120. Tax Data

For Indian billing, product/document tax data may include:

HSN
GST Rate
CGST
SGST
IGST

Tax details used in issued documents must be snapshotted.

Do not recalculate historical invoices using today’s product tax configuration.

⸻

121. GSTIN

GSTIN fields should be normalized and validated at application level.

Store without presentation-specific formatting.

Index if frequently searched.

Do not assume every lead/contact has a GSTIN.

⸻

122. State / Place of Supply

If billing tax determination requires state/place-of-supply information, store appropriate normalized state codes.

Do not determine tax solely from free-text address strings.

Exact GST rules must be defined in billing requirements before implementation.

⸻

123. Customer Credit

If credit management is included:

Potential fields:

credit_limit
payment_terms_days

should live on the customer profile/company configuration.

Do not calculate credit exposure only from UI state.

Future credit exposure may derive from:

Outstanding Invoices
+
Unbilled Orders

depending on business policy.

⸻

124. Notes

Avoid adding a generic notes column as a substitute for structured data.

Use notes for genuinely unstructured information.

If information needs:

* Filtering
* Reporting
* Validation
* Workflow Logic

it should probably have its own field/table.

⸻

125. JSON Usage

PostgreSQL JSON/JSONB is appropriate for:

* Provider Webhook Payloads
* Audit Before/After Data
* Flexible Integration Metadata
* Non-critical Configuration Metadata

Do not use JSON as a substitute for relational modeling of:

* Customers
* Products
* Orders
* Invoice Items
* Payments
* Stock Movements

⸻

126. Database Transactions

Transactions are mandatory for multi-write operations requiring consistency.

Examples:

Lead Conversion
Quotation → Sales Order
Goods Receipt
Inventory Adjustment
Invoice Issue
Payment Allocation

⸻

127. Lead Conversion Transaction

Conceptually:

BEGIN
Create / Match Company
Create / Match Contact
Update Lead as Converted
Link Converted Entities
Create Activity
Create Audit Record
COMMIT

If the conversion fails midway, the lead should not be left partially converted.

⸻

128. Sales Order Confirmation

If confirmation reserves stock:

BEGIN
Validate Order
Validate Stock
Update Order State
Create Reservations / Movements
Update Inventory Balance
Create Audit
COMMIT

Exact inventory behavior follows INVENTORY.md.

⸻

129. Invoice Creation Transaction

Conceptually:

BEGIN
Validate Source Order
Create Invoice
Create Invoice Items
Calculate Tax
Calculate Totals
Generate Document Number
Update Related State where applicable
Create Audit
COMMIT

⸻

130. Concurrency Control

Concurrency-sensitive operations include:

* Document Number Generation
* Stock Changes
* Payment Allocation
* Approval
* Conversion
* Duplicate Record Prevention

Use appropriate:

* Transactions
* Row Locks
* Unique Constraints
* Optimistic Locking

depending on the operation.

⸻

131. Optimistic Locking

Consider a version field for highly concurrent editable records.

Example:

version

Update:

WHERE id = ?
AND version = ?

This can prevent one user’s edits silently overwriting another’s.

Introduce where actual concurrency risk warrants it.

⸻

132. Duplicate Lead Prevention

Potential duplicate detection fields:

normalized_phone
normalized_email

Do not enforce overly strict uniqueness if business reality allows shared contact details.

Instead use duplicate detection/merge workflows where appropriate.

⸻

133. Phone Normalization

Store phone numbers in a normalized canonical format where practical.

Example:

+919876543210

Presentation can display:

+91 98765 43210

This improves:

* Search
* Duplicate Detection
* WhatsApp Integration
* SMS Integration

⸻

134. Email Normalization

Normalize emails for matching/searching.

Do not modify the meaningful local-part semantics beyond safe normalization rules.

⸻

135. Search Columns

Frequently searched values should have normalized searchable representations where useful.

Examples:

phone_normalized
email_normalized
name_search
sku
document_number

Do not prematurely duplicate every text field.

⸻

136. Full-text Search

Initial search can use PostgreSQL.

Potentially index:

* Customer Name
* Lead Name
* Product Name
* Product SKU

Advanced search infrastructure should only be introduced when justified.

⸻

137. Data Import

Imported records should retain useful provenance where required.

Potential fields:

import_batch_id

A separate:

import_batches

table may track:

id
entity_type
file_id
status
total_rows
successful_rows
failed_rows
created_by
created_at
completed_at

Introduce when bulk import is implemented.

⸻

138. Import Errors

Potential:

import_errors

Fields:

import_batch_id
row_number
error_code
error_message
raw_data

This helps users correct failed imports without losing successful records.

⸻

139. Export

Exports generally should not require permanent database records unless:

* Generated asynchronously
* Downloadable later
* Audit/history is required

Then use a job/export record linked to generated files.

⸻

140. Background Jobs

If the queue system maintains jobs externally, application tables do not need to duplicate the queue.

However, user-visible long-running operations may need records such as:

report_jobs
import_batches
export_jobs

These represent business-visible operation state.

⸻

141. Idempotency Keys

Potential table:

idempotency_keys

may be used for sensitive API operations.

Fields conceptually:

key
user_id
operation
request_hash
response_reference
created_at
expires_at

Use where duplicate requests create meaningful risk.

⸻

142. Integration Webhook Events

Potential table:

integration_events

Fields:

id
provider
external_event_id
event_type
payload
processing_status
received_at
processed_at
failure_reason

Unique:

(provider, external_event_id)

where provider guarantees unique IDs.

⸻

143. Webhook Processing State

Potential:

received
processing
processed
failed
ignored

This improves debugging and retry handling.

⸻

144. Database Security

Production database must:

* Not be publicly exposed unnecessarily
* Require authenticated connections
* Use encrypted transport
* Use least-privilege database users
* Restrict migration privileges
* Maintain backups

Application clients must not directly connect to the database.

⸻

145. Database Users

Where infrastructure allows, separate:

Application User
Migration User
Read-only Reporting User

according to operational need.

Do not give the runtime application unrestricted administrative database privileges.

⸻

146. Secrets

Database credentials belong in:

Environment / Secret Manager

Never:

Git
Frontend Code
Committed Configuration

⸻

147. Migrations

All schema changes must use version-controlled migrations.

Migration examples:

create_users
create_crm_tables
create_products
create_inventory
create_sales
create_purchase
create_billing
create_communications

Exact migration grouping depends on implementation.

⸻

148. Migration Naming

Use descriptive names.

Good:

add_payment_allocations
add_inventory_reservations
add_invoice_tax_snapshot

Avoid:

update_db
fix_table
changes2

⸻

149. Migration Safety

Be careful with:

* Dropping Columns
* Renaming Columns
* Adding Non-null Columns to Existing Tables
* Large Data Backfills
* Changing Numeric Precision
* Creating Large Indexes
* Enum Changes

Production migrations must account for existing data.

⸻

150. Seed Data

Seed data may include:

* System Roles
* Permissions
* Units
* Default Lead Sources
* Reference Settings

Development seed data may additionally include:

* Sample Users
* Customers
* Products
* Leads
* Orders

Never mix fake development data into production seeds.

⸻

151. Backup Strategy

Production database requires automated backups.

At minimum:

Automated Backup
+
Retention
+
Point-in-time Recovery where infrastructure supports it
+
Restore Testing

Backup configuration belongs to infrastructure/deployment documentation.

⸻

152. Restore Testing

Periodically verify that backups can actually be restored.

Do not treat:

Backup job succeeded

as proof that disaster recovery works.

⸻

153. Data Retention

Retention rules may eventually differ for:

* Audit Logs
* Communication Events
* Provider Payloads
* Notifications
* Files
* Import Logs

Do not indefinitely retain unnecessary integration payloads without reason.

⸻

154. Privacy

Store only information needed for legitimate business operations.

Avoid unnecessary personal data.

Architecture should allow:

* Data Export
* Correction
* Archival
* Retention Management

as future compliance requirements demand.

⸻

155. Mobile Readiness

The future mobile application will use API-exposed records.

Therefore:

* Use stable IDs
* Avoid browser-specific identifiers
* Store canonical timestamps
* Store normalized phone numbers
* Keep business logic server-side
* Avoid client-generated document numbers
* Preserve API-compatible relationships

The database should not require redesign merely because a mobile client is added.

⸻

156. Potential Offline Mobile Consideration

If future mobile requirements include offline lead capture, globally unique client-generated IDs can simplify synchronization.

Example:

UUID

can be generated before server synchronization.

Do not implement offline synchronization now unless explicitly required.

The identifier architecture simply should not block it.

⸻

157. Multi-Tenant Readiness

Do not implement complex multi-tenancy unless PROJECT.md requires it.

If this becomes a SaaS product serving multiple distributor organizations, most business tables may require:

organization_id

and unique constraints/indexes would need organization scope.

This is a significant architecture decision and should not be added casually.

⸻

158. Single-Organization Initial Model

For the current distributor-focused implementation, keep the database simpler if the product is for one organization.

Do not add organization_id to every table merely for hypothetical future use unless product strategy confirms multi-tenancy.

⸻

159. Entity Relationship Overview

Conceptually:

USER
 │
 ├────────────── TEAM
 │
 └────────────── ROLE ─── PERMISSION
LEAD
 │
 ├── LEAD ACTIVITY
 ├── FOLLOW-UP
 ├── COMMUNICATION
 │
 └── converts to
        │
        ├── CONTACT
        └── COMPANY
               │
               ├── QUOTATION
               │      │
               │      └── QUOTATION ITEM
               │
               ├── SALES ORDER
               │      │
               │      └── SALES ORDER ITEM
               │
               ├── INVOICE
               │      │
               │      └── INVOICE ITEM
               │
               └── PAYMENT
                      │
                      └── PAYMENT ALLOCATION
                               │
                               └── INVOICE
PRODUCT
 │
 ├── CATEGORY
 ├── BRAND
 ├── UNIT
 │
 ├── QUOTATION ITEM
 ├── SALES ORDER ITEM
 ├── INVOICE ITEM
 ├── PURCHASE ORDER ITEM
 │
 └── STOCK MOVEMENT
          │
          └── WAREHOUSE
SUPPLIER / COMPANY
 │
 └── PURCHASE ORDER
         │
         ├── PURCHASE ORDER ITEM
         │
         └── GOODS RECEIPT
                │
                └── GOODS RECEIPT ITEM
                         │
                         └── STOCK MOVEMENT

⸻

160. Critical Relationship Chain

Sales:

Lead
↓
Company / Contact
↓
Quotation
↓
Sales Order
↓
Invoice
↓
Payment Allocation
↓
Payment

Inventory/Purchase:

Supplier
↓
Purchase Order
↓
Goods Receipt
↓
Stock Movement
↓
Inventory Balance

Communication:

Lead / Customer / Document
↓
Communication
↓
Communication Events
↓
External Provider

⸻

161. Source of Truth

Use the following ownership principles:

User Identity
→ users
Customer / Supplier Identity
→ companies / contacts
Product Information
→ products
Stock History
→ stock_movements
Current Stock
→ inventory_balances
Quotation
→ quotations
Order
→ sales_orders
Purchase
→ purchase_orders
Invoice
→ invoices
Payment
→ payments + payment_allocations
Communication History
→ communications
System Audit
→ audit_logs

Do not maintain conflicting copies.

⸻

162. Derived Data

Examples:

Available Stock
=
On Hand - Reserved
Invoice Outstanding
=
Invoice Total - Allocated Payments
PO Remaining Quantity
=
Ordered - Received
Quotation Conversion Rate
=
Converted Quotations / Relevant Quotations

Derived values should have one clearly defined calculation.

⸻

163. Persisted Derived Values

Persist derived values only when:

* Query performance requires it
* Business workflow benefits
* Transactional update can guarantee correctness

Examples potentially persisted:

invoice.paid_amount
invoice.outstanding_amount
purchase_order_item.received_quantity
inventory_balance.on_hand_quantity

These are optimization/state values and must remain reconcilable with source transactions.

⸻

164. Reconciliation

For critical persisted aggregates, provide the ability to verify them against transactional history.

Examples:

Inventory Balance
vs
Stock Movement Sum
Invoice Paid Amount
vs
Payment Allocation Sum

This is valuable for operational integrity.

⸻

165. Database Anti-Patterns

Do NOT:

* Store money as float
* Store quantity as integer without checking unit requirements
* Use document numbers as primary keys
* Use COUNT + 1 for numbering
* Delete leads after conversion
* Delete customers with historical invoices
* Delete products referenced by historical documents
* Recalculate old invoices using current product prices
* Recalculate old tax using current tax settings
* Update inventory without movement records
* Store binary attachments directly in ordinary business tables
* Store all business entities in JSON
* Store every status as free text
* Trust frontend-calculated totals
* Allow arbitrary direct inventory-balance updates
* Create one giant generic transactions table for all business processes
* Create duplicate customer tables for every module
* Create separate product masters for Sales/Purchase/Inventory
* Store provider credentials as plaintext
* Ignore foreign keys
* Add indexes without query justification
* Cascade-delete historical business records
* Use production data as development seed data

⸻

166. Claude Database Instruction

Before creating or modifying database schema, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read ARCHITECTURE.md.
4. Read DATABASE.md.
5. Read the relevant module document.
6. Identify entity ownership.
7. Identify relationships.
8. Determine required constraints.
9. Determine transaction boundaries.
10. Consider historical snapshot requirements.
11. Consider audit requirements.
12. Consider concurrency.
13. Consider indexing.
14. Consider archive behavior.
15. Consider mobile/API compatibility.
16. Avoid unnecessary duplication.
17. Generate a migration.
18. Update documentation when schema meaning changes.

⸻

167. Claude Migration Instruction

Claude must never modify the production schema manually.

For every schema change:

Model Change
↓
Migration
↓
Review
↓
Test
↓
Apply

If existing production data is affected, Claude must consider:

Backfill
Compatibility
Rollback / Recovery
Deployment Order

before implementing the migration.

⸻

168. Claude Query Instruction

When writing queries:

* Avoid N+1 patterns
* Select only required columns where practical
* Paginate large datasets
* Use indexes appropriately
* Avoid unnecessary joins
* Use transactions for consistency
* Inspect query performance for reports
* Preserve authorization scope

Do not optimize blindly before measuring.

⸻

169. Claude Financial Data Instruction

For financial operations Claude must:

* Use decimal arithmetic
* Recalculate on backend
* Use database transactions
* Preserve snapshots
* Avoid editing issued historical values casually
* Validate payment allocations
* Prevent duplicate processing
* Audit important changes
* Use INR/en-IN presentation for the initial configured business context

Financial correctness has priority over implementation convenience.

⸻

170. Claude Inventory Instruction

For inventory-changing operations Claude must:

Validate
↓
Begin Transaction
↓
Create Stock Movement
↓
Update Balance
↓
Update Related Business Record
↓
Audit
↓
Commit

where applicable.

Do not:

UPDATE inventory_balances

from arbitrary controllers or UI operations.

⸻

171. Claude Communication Instruction

When implementing communication:

Business Entity
↓
Communication Record
↓
Queue
↓
Provider Adapter
↓
Provider
↓
Webhook
↓
Communication Event
↓
Normalized Status

Do not directly store provider-specific state across CRM tables.

⸻

172. Database Implementation Order

Recommended implementation sequence:

1. Core / Identity
   ├── Users
   ├── Teams
   ├── Roles
   └── Permissions
2. CRM Foundation
   ├── Companies
   ├── Contacts
   ├── Leads
   ├── Activities
   └── Follow-ups
3. Product Foundation
   ├── Categories
   ├── Brands
   ├── Units
   └── Products
4. Inventory Foundation
   ├── Warehouses
   ├── Inventory Balances
   └── Stock Movements
5. Sales
   ├── Quotations
   ├── Quotation Items
   ├── Sales Orders
   └── Sales Order Items
6. Purchase
   ├── Purchase Orders
   ├── Purchase Order Items
   ├── Goods Receipts
   └── Goods Receipt Items
7. Billing
   ├── Invoices
   ├── Invoice Items
   ├── Payments
   └── Payment Allocations
8. Platform
   ├── Files
   ├── Communications
   ├── Communication Events
   ├── Notifications
   ├── Audit Logs
   └── Document Sequences

This order minimizes circular setup dependencies.

⸻

173. Database Success Criteria

The database design succeeds when:

* A lead can become a customer without losing history.
* Customer data is shared across CRM, Sales, and Billing.
* Product data is shared across Sales, Purchase, Inventory, and Billing.
* Historical document prices remain unchanged when product prices change.
* Historical tax remains unchanged when tax configuration changes.
* Stock changes can always be explained.
* Partial PO receipts are supported.
* Multiple payments can settle one invoice.
* One payment can settle multiple invoices.
* Communication history remains attached to business context.
* Provider webhooks can be processed idempotently.
* Permissions remain centrally modeled.
* Important business actions are auditable.
* Concurrent stock operations cannot silently corrupt inventory.
* Concurrent document generation cannot create duplicate numbers.
* Future mobile clients can safely use stable IDs.
* Reports can be generated without becoming a second source of truth.

⸻

174. Final Database Principle

The database should model business reality, not individual screens.

The core model is:

People & Companies
        │
        ▼
       CRM
        │
        ▼
      Sales
        │
        ▼
     Billing
        │
        ▼
     Payments

supported by:

Products
   │
   ├── Inventory
   │
   └── Purchase

and connected through:

Communication
Notifications
Files
Audit

The most important integrity principles are:

Money
→ Decimal
Stock
→ Ledger
Documents
→ Historical Snapshots
Payments
→ Allocations
Relationships
→ Foreign Keys
Critical Operations
→ Transactions
History
→ Audit
External Providers
→ Integration Records
Identifiers
→ Stable System IDs

The database should remain normalized enough to maintain integrity, practical enough to query efficiently, and structured enough to support the web application today and a mobile application later without redesigning the core business model.