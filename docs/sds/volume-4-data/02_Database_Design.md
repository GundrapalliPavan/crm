# Database Design Document

**Project:** CRM Platform\
**Document:** 02_Database_Design.md\
**Version:** 1.0

------------------------------------------------------------------------

# 1. Objective

This document defines the logical database design for the CRM Platform.
It serves as the foundation for the PostgreSQL schema, Prisma models,
API development, and business logic.

Design Goals:

-   PostgreSQL as the primary relational database
-   Multi-tenant architecture
-   UUID primary keys
-   Normalized schema (3NF where practical)
-   Soft delete support
-   Auditability
-   Scalable for future modules

------------------------------------------------------------------------

# 2. Database Standards

## Primary Keys

-   UUID for all entities

## Audit Fields

Every transactional table should contain:

-   id
-   organization_id (except global master tables)
-   created_by
-   updated_by
-   created_at
-   updated_at
-   deleted_at (nullable)

## Naming Conventions

-   snake_case table names
-   snake_case column names
-   Singular model names in Prisma
-   Foreign keys end with \_id

------------------------------------------------------------------------

# 3. Core Entity Groups

## Security

-   organizations
-   users
-   roles
-   permissions
-   user_roles
-   role_permissions
-   sessions

## CRM

-   leads
-   lead_status
-   lead_sources
-   customers
-   contacts
-   visits
-   activities
-   tasks
-   notes
-   attachments

## Sales

-   products
-   orders
-   order_items
-   order_status

## Finance

-   invoices
-   payments
-   payment_methods

## System

-   notifications
-   audit_logs
-   settings

------------------------------------------------------------------------

# 4. Entity Relationships

Organization - has many Users - has many Leads - has many Customers -
has many Orders - has many Invoices

User - belongs to Organization - has many Leads - has many Visits - has
many Tasks

Lead - belongs to Organization - belongs to Sales Executive - belongs to
Lead Status - belongs to Lead Source - has many Visits - has many
Notes - has many Activities - may convert into Customer

Customer - has many Contacts - has many Orders - has many Invoices

Order - belongs to Customer - has many Order Items - has one or more
Invoices

Invoice - belongs to Order - has many Payments

------------------------------------------------------------------------

# 5. Table Inventory

  Group      Tables
  ---------- --------
  Security   7
  CRM        10
  Sales      4
  Finance    3
  System     4

Estimated Total: **28 tables**

------------------------------------------------------------------------

# 6. Master Tables

The following tables are configurable by administrators.

-   lead_status
-   lead_sources
-   order_status
-   payment_methods
-   roles
-   permissions

These should be seeded during deployment.

------------------------------------------------------------------------

# 7. Transaction Tables

-   leads
-   visits
-   activities
-   tasks
-   orders
-   order_items
-   invoices
-   payments

These represent business transactions.

------------------------------------------------------------------------

# 8. Soft Delete Strategy

Business tables should support:

-   deleted_at

Records are never permanently removed unless explicitly archived.

------------------------------------------------------------------------

# 9. Indexing Strategy

Create indexes for:

-   organization_id
-   user_id
-   lead_id
-   customer_id
-   order_id
-   invoice_id
-   status_id
-   created_at

Composite indexes should be added after performance testing.

------------------------------------------------------------------------

# 10. Multi-Tenancy

Every business record belongs to one Organization.

Rules:

-   Users only access their organization.
-   Cross-organization access is prohibited.
-   organization_id is mandatory on all business entities.

------------------------------------------------------------------------

# 11. File Storage

Files are stored in object storage.

Database stores only:

-   file_name
-   file_url
-   mime_type
-   file_size
-   uploaded_by
-   uploaded_at

------------------------------------------------------------------------

# 12. Audit Logging

Critical operations must be recorded.

Capture:

-   User
-   Module
-   Action
-   Entity
-   Record ID
-   Previous Value
-   New Value
-   Timestamp
-   IP Address (optional)

------------------------------------------------------------------------

# 13. Future Expansion

The schema should support future modules without redesign:

-   Inventory
-   Purchase Management
-   Vendor Management
-   AI Assistant
-   WhatsApp Integration
-   Email Integration
-   Workflow Automation
-   Customer Portal
-   Mobile Offline Sync

------------------------------------------------------------------------

# 14. Deliverables

The next project documents will be created from this design:

1.  ER Diagram
2.  PostgreSQL Schema
3.  Prisma Schema
4.  Seed Data
5.  API Specification

------------------------------------------------------------------------

# Notes for Claude Code

Do not generate SQL until the ER Diagram has been finalized.

The implementation order must be:

1.  ER Diagram
2.  PostgreSQL Schema
3.  Prisma Models
4.  Database Migrations
5.  Seed Data
6.  Repository Layer
7.  Services
8.  APIs
