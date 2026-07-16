# Prisma Schema Specification

**Project:** CRM Platform\
**Document:** 05_Prisma_Schema.md\
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the Prisma ORM conventions and model specification
that maps the PostgreSQL database into type-safe application models.

It is the authoritative source for generating:

-   schema.prisma
-   Prisma Client
-   Database migrations
-   Repository layer

------------------------------------------------------------------------

# Technology

-   Prisma ORM 6+
-   PostgreSQL 16+
-   UUID primary keys
-   Decimal for monetary values
-   DateTime (UTC)
-   JSON fields using Json type

------------------------------------------------------------------------

# Generator

``` prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

------------------------------------------------------------------------

# Global Conventions

## IDs

Every model:

``` prisma
id String @id @default(uuid()) @db.Uuid
```

## Audit Fields

Every transactional model contains:

-   createdAt
-   updatedAt
-   createdBy
-   updatedBy
-   deletedAt

## Multi-tenancy

Business models contain:

``` prisma
organizationId String @db.Uuid
organization   Organization @relation(fields: [organizationId], references: [id])
```

------------------------------------------------------------------------

# Naming Conventions

  Prisma         PostgreSQL
  -------------- ---------------
  Organization   organizations
  User           users
  Lead           leads
  Customer       customers
  Order          orders
  Invoice        invoices

Use:

-   @@map()
-   @map()

to preserve database naming.

------------------------------------------------------------------------

# Core Models

## Security

-   Organization
-   User
-   Role
-   Permission
-   UserRole
-   RolePermission
-   Session

Relationships:

-   Organization hasMany Users
-   User manyToMany Roles
-   Role manyToMany Permissions

------------------------------------------------------------------------

## CRM

Models:

-   Lead
-   LeadStatus
-   LeadSource
-   Customer
-   Contact
-   Visit
-   Task
-   Activity
-   Note
-   Attachment

Lead Relations

``` text
Lead
├── Organization
├── Owner(User)
├── LeadStatus
├── LeadSource
├── Visits[]
├── Activities[]
├── Notes[]
└── Customer?
```

------------------------------------------------------------------------

## Sales

Models

-   Product
-   Order
-   OrderItem
-   OrderStatus

Order Relations

``` text
Customer

↓

Orders[]

↓

OrderItems[]

↓

Product
```

------------------------------------------------------------------------

## Finance

Models

-   Invoice
-   Payment
-   PaymentMethod

Invoice Relations

``` text
Order

↓

Invoice

↓

Payments[]
```

------------------------------------------------------------------------

# Enums

Use Prisma enums for application-level constants.

Examples

``` prisma
enum UserStatus {
  ACTIVE
  INACTIVE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum NotificationStatus {
  UNREAD
  READ
}
```

Master data such as Lead Status, Lead Source, and Order Status remain
lookup tables rather than enums.

------------------------------------------------------------------------

# Common Attributes

Money

``` prisma
Decimal @db.Decimal(14,2)
```

Email

``` prisma
String @db.VarChar(255)
```

Phone

``` prisma
String? @db.VarChar(20)
```

JSON

``` prisma
Json?
```

------------------------------------------------------------------------

# Index Strategy

Every model should include indexes for:

-   organizationId
-   createdAt
-   updatedAt

Business models additionally index:

-   ownerId
-   statusId
-   customerId
-   orderId
-   invoiceId

Example

``` prisma
@@index([organizationId])
@@index([createdAt])
@@index([ownerId])
```

------------------------------------------------------------------------

# Unique Constraints

Examples

``` prisma
@@unique([organizationId, email])

@@unique([userId, roleId])

@@unique([invoiceNumber])

@@unique([orderNumber])
```

------------------------------------------------------------------------

# Soft Delete

Every transactional model

``` prisma
deletedAt DateTime?
```

Application queries should ignore deleted records by default.

------------------------------------------------------------------------

# Mapping

Example

``` prisma
model Lead {
  id String @id @default(uuid())

  organizationId String @map("organization_id")

  createdAt DateTime @default(now()) @map("created_at")

  @@map("leads")
}
```

------------------------------------------------------------------------

# Folder Structure

``` text
prisma/

schema.prisma

migrations/

seed.ts
```

------------------------------------------------------------------------

# Seed Data

Create seed scripts for:

-   Roles
-   Permissions
-   Lead Status
-   Lead Sources
-   Order Status
-   Payment Methods

The application should not depend on manual insertion of master data.

------------------------------------------------------------------------

# Migration Strategy

1.  Initial schema
2.  Seed master data
3.  Feature-based migrations only
4.  Never edit existing production migrations
5.  Create new migrations for schema evolution

------------------------------------------------------------------------

# Claude Code Instructions

-   Generate one consolidated schema.prisma file.
-   Use explicit relation names where required.
-   Use @@map() for all database tables.
-   Use @map() for snake_case columns.
-   Generate Prisma Client after every migration.
-   Keep business logic outside Prisma models.
-   Do not use implicit many-to-many relationships; use junction tables
    for RBAC.
