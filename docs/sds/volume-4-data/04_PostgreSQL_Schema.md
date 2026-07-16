# PostgreSQL Schema Specification

**Project:** CRM Platform\
**Document:** 04_PostgreSQL_Schema.md\
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the physical PostgreSQL schema for the CRM
Platform. It is the authoritative reference for generating Prisma
models, migrations, and database objects.

------------------------------------------------------------------------

# Database Standards

-   PostgreSQL 16+
-   UUID primary keys (`gen_random_uuid()`)
-   UTC timestamps
-   snake_case naming
-   Foreign key constraints
-   Soft delete using `deleted_at`
-   Multi-tenant design via `organization_id`

------------------------------------------------------------------------

# Standard Columns

All transactional tables should include:

  Column            Type
  ----------------- ------------------
  id                UUID
  organization_id   UUID
  created_by        UUID
  updated_by        UUID
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
  deleted_at        TIMESTAMPTZ NULL

------------------------------------------------------------------------

# Table Specifications

## organizations

Primary Key - id

Columns - name - legal_name - email - phone - address - status -
created_at - updated_at

Indexes - name - status

------------------------------------------------------------------------

## users

Foreign Keys - organization_id → organizations.id

Columns - first_name - last_name - email (UNIQUE) - phone -
password_hash - is_active - last_login_at

Indexes - organization_id - email

------------------------------------------------------------------------

## roles

Columns - name - description

Unique - name

------------------------------------------------------------------------

## permissions

Columns - module - action - description

------------------------------------------------------------------------

## user_roles

Foreign Keys - user_id - role_id

Composite Unique - (user_id, role_id)

------------------------------------------------------------------------

## leads

Foreign Keys - organization_id - owner_id - status_id - source_id

Columns - title - company_name - contact_name - email - phone -
expected_value NUMERIC(14,2) - expected_close_date - remarks

Indexes - organization_id - owner_id - status_id - created_at

------------------------------------------------------------------------

## lead_status

Columns - name - sequence - color - is_closed

------------------------------------------------------------------------

## lead_sources

Columns - name - description

------------------------------------------------------------------------

## visits

Foreign Keys - lead_id - user_id

Columns - visit_date - check_in - check_out - latitude - longitude -
location_name - outcome - remarks - follow_up_date

Indexes - lead_id - user_id - visit_date

------------------------------------------------------------------------

## customers

Foreign Keys - organization_id - converted_from_lead_id

Columns - customer_name - gst_number - email - phone - address - city -
state - country

------------------------------------------------------------------------

## contacts

Foreign Keys - customer_id

Columns - first_name - last_name - designation - email - phone

------------------------------------------------------------------------

## products

Columns - sku - name - description - unit_price - tax_percentage -
is_active

------------------------------------------------------------------------

## orders

Foreign Keys - customer_id - status_id

Columns - order_number - order_date - subtotal - discount - tax -
total_amount

Indexes - customer_id - order_number

------------------------------------------------------------------------

## order_items

Foreign Keys - order_id - product_id

Columns - quantity - unit_price - tax - line_total

------------------------------------------------------------------------

## order_status

Columns - name - sequence

------------------------------------------------------------------------

## invoices

Foreign Keys - order_id

Columns - invoice_number - invoice_date - due_date - subtotal - tax -
total_amount - balance_amount

------------------------------------------------------------------------

## payments

Foreign Keys - invoice_id - payment_method_id

Columns - payment_date - amount - reference_number - remarks

------------------------------------------------------------------------

## payment_methods

Columns - name - description

------------------------------------------------------------------------

## tasks

Foreign Keys - assigned_to - lead_id

Columns - title - due_date - priority - status

------------------------------------------------------------------------

## activities

Foreign Keys - lead_id - user_id

Columns - activity_type - activity_time - remarks

------------------------------------------------------------------------

## notes

Foreign Keys - lead_id - user_id

Columns - note

------------------------------------------------------------------------

## attachments

Columns - entity_type - entity_id - file_name - file_url - mime_type -
file_size

------------------------------------------------------------------------

## notifications

Foreign Keys - user_id

Columns - title - message - is_read - sent_at

------------------------------------------------------------------------

## audit_logs

Columns - module - entity - entity_id - action - old_value JSONB -
new_value JSONB - ip_address

Indexes - entity_id - module - created_at

------------------------------------------------------------------------

## settings

Columns - setting_key - setting_value JSONB - scope

------------------------------------------------------------------------

# Constraints

-   Enforce foreign keys.
-   Use ON DELETE RESTRICT by default.
-   Use CASCADE only for junction tables.
-   Validate positive monetary values with CHECK constraints.
-   Enforce UNIQUE constraints where applicable.

------------------------------------------------------------------------

# Performance Guidelines

Create indexes for:

-   organization_id
-   owner_id
-   customer_id
-   order_id
-   invoice_id
-   status_id
-   created_at

Add composite indexes after workload analysis.

------------------------------------------------------------------------

# Seed Data

Seed the following:

-   Roles
-   Permissions
-   Lead Status
-   Lead Sources
-   Order Status
-   Payment Methods

------------------------------------------------------------------------

# Next Step

Generate Prisma schema directly from this specification before creating
migrations.
