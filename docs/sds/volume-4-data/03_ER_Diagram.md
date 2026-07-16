# Entity Relationship Diagram (ERD)

**Project:** CRM Platform\
**Document:** 03_ER_Diagram.md\
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the logical Entity Relationship Diagram (ERD) for
the CRM Platform. It is the authoritative source for generating the
PostgreSQL schema, Prisma models, migrations, repositories, and APIs.

------------------------------------------------------------------------

# Entity Groups

## Security

-   Organization
-   User
-   Role
-   Permission
-   UserRole
-   RolePermission
-   Session

## CRM

-   Lead
-   LeadStatus
-   LeadSource
-   Customer
-   Contact
-   Visit
-   Activity
-   Task
-   Note
-   Attachment

## Sales

-   Product
-   Order
-   OrderItem
-   OrderStatus

## Finance

-   Invoice
-   Payment
-   PaymentMethod

## System

-   Notification
-   AuditLog
-   Setting

------------------------------------------------------------------------

# High-Level Relationships

-   One Organization has many Users.
-   One Organization has many Leads.
-   One User owns many Leads.
-   One Lead belongs to one Lead Status.
-   One Lead belongs to one Lead Source.
-   One Lead has many Visits.
-   One Lead has many Notes.
-   One Lead has many Activities.
-   One Lead may convert into one Customer.
-   One Customer has many Contacts.
-   One Customer has many Orders.
-   One Order has many Order Items.
-   One Order has one or more Invoices.
-   One Invoice has many Payments.

------------------------------------------------------------------------

# Mermaid ER Diagram

``` mermaid
erDiagram

ORGANIZATION ||--o{ USER : has
ORGANIZATION ||--o{ LEAD : owns
ORGANIZATION ||--o{ CUSTOMER : owns
ORGANIZATION ||--o{ PRODUCT : owns

ROLE ||--o{ USER_ROLE : assigns
USER ||--o{ USER_ROLE : receives

PERMISSION ||--o{ ROLE_PERMISSION : maps
ROLE ||--o{ ROLE_PERMISSION : contains

USER ||--o{ LEAD : assigned_to

LEAD_STATUS ||--o{ LEAD : status
LEAD_SOURCE ||--o{ LEAD : source

LEAD ||--o{ VISIT : has
LEAD ||--o{ NOTE : has
LEAD ||--o{ ACTIVITY : has
LEAD ||--|| CUSTOMER : converts_to

CUSTOMER ||--o{ CONTACT : has
CUSTOMER ||--o{ ORDER : places

ORDER_STATUS ||--o{ ORDER : status
ORDER ||--o{ ORDER_ITEM : contains
PRODUCT ||--o{ ORDER_ITEM : referenced_by

ORDER ||--o{ INVOICE : generates
PAYMENT_METHOD ||--o{ PAYMENT : uses
INVOICE ||--o{ PAYMENT : receives

USER ||--o{ TASK : owns
USER ||--o{ NOTIFICATION : receives

USER ||--o{ AUDIT_LOG : creates
```

------------------------------------------------------------------------

# Cardinality

  Parent         Child         Relationship
  -------------- ------------- ------------------
  Organization   Users         1:N
  Organization   Leads         1:N
  User           Leads         1:N
  Lead           Visits        1:N
  Lead           Notes         1:N
  Lead           Activities    1:N
  Lead           Customer      1:1 (Conversion)
  Customer       Contacts      1:N
  Customer       Orders        1:N
  Order          Order Items   1:N
  Order          Invoices      1:N
  Invoice        Payments      1:N

------------------------------------------------------------------------

# Primary Keys

All entities use UUID primary keys.

------------------------------------------------------------------------

# Foreign Keys

Examples:

-   user.organization_id → organization.id
-   lead.owner_id → user.id
-   lead.status_id → lead_status.id
-   lead.source_id → lead_source.id
-   visit.lead_id → lead.id
-   customer.organization_id → organization.id
-   order.customer_id → customer.id
-   invoice.order_id → order.id
-   payment.invoice_id → invoice.id

------------------------------------------------------------------------

# Business Constraints

-   A Lead cannot exist without an Organization.
-   Every Lead must have a Status.
-   Every Order belongs to exactly one Customer.
-   Payments cannot exist without an Invoice.
-   Users can only access records belonging to their Organization.
-   Customer creation through lead conversion should preserve lead
    history.

------------------------------------------------------------------------

# Recommended Indexes

-   organization_id
-   owner_id
-   status_id
-   customer_id
-   order_id
-   invoice_id
-   created_at
-   updated_at

------------------------------------------------------------------------

# Data Dictionary (Summary)

  Entity         Purpose
  -------------- --------------------
  Organization   Tenant/company
  User           Platform user
  Lead           Sales opportunity
  Visit          Field visit
  Customer       Converted lead
  Order          Customer purchase
  Invoice        Billing document
  Payment        Payment record
  Product        Saleable item
  AuditLog       Compliance history

------------------------------------------------------------------------

# Implementation Order

1.  PostgreSQL Schema
2.  Prisma Schema
3.  Database Migrations
4.  Seed Data
5.  Repository Layer
6.  Services
7.  REST APIs
8.  Frontend Integration

------------------------------------------------------------------------

# Notes for Claude Code

-   Preserve referential integrity.
-   Use UUIDs.
-   Enable cascading only where appropriate.
-   Prefer soft deletes for transactional entities.
-   Generate Prisma models directly from this ERD.
