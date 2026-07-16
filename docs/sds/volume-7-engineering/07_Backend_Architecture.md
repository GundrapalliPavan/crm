# Backend Architecture

**Project:** CRM Platform **Document:** 07_Backend_Architecture.md
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the backend architecture, coding standards, module
boundaries, and implementation strategy for the CRM Platform.

The backend must be modular, scalable, secure, and maintainable.

------------------------------------------------------------------------

# Technology Stack

-   Runtime: Node.js 22+
-   Framework: NestJS
-   Language: TypeScript
-   ORM: Prisma
-   Database: PostgreSQL
-   Authentication: JWT + Refresh Tokens
-   Validation: class-validator + class-transformer
-   Queue: BullMQ
-   Cache: Redis
-   API Docs: Swagger / OpenAPI
-   File Storage: S3 Compatible Storage
-   Logging: Pino
-   Testing: Jest + Supertest

------------------------------------------------------------------------

# Architecture Principles

-   Feature-first modular architecture
-   Separation of concerns
-   Dependency Injection
-   Repository Pattern
-   Service Layer Pattern
-   DTO-based validation
-   No business logic in controllers
-   Thin controllers, rich services

------------------------------------------------------------------------

# Project Structure

``` text
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   ├── common/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── enums/
│   │   ├── exceptions/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── leads/
│   │   ├── visits/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── settings/
│   └── prisma/
└── test/
```

------------------------------------------------------------------------

# Module Pattern

Every module follows:

``` text
module/
├── controller.ts
├── service.ts
├── repository.ts
├── dto/
├── entities/
├── mapper.ts
├── module.ts
└── spec.ts
```

------------------------------------------------------------------------

# Request Flow

Client

↓

Controller

↓

DTO Validation

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

------------------------------------------------------------------------

# Authentication

-   JWT Access Token
-   Refresh Token Rotation
-   Password Hashing (Argon2)
-   Role-Based Access Control
-   Organization Isolation
-   Session Tracking

Public endpoints: - Login - Forgot Password - Reset Password

All other endpoints require authentication.

------------------------------------------------------------------------

# Authorization

Use NestJS Guards.

Checks: - Authenticated user - Organization ownership - Role -
Permission - Resource access

------------------------------------------------------------------------

# Validation

Use DTOs.

Rules: - Validate all input - Reject unknown fields - Never trust client
data - Centralized validation pipe

------------------------------------------------------------------------

# Error Handling

Global Exception Filter.

Standard response:

``` json
{
  "success": false,
  "message": "",
  "errors": []
}
```

------------------------------------------------------------------------

# Logging

Log: - Requests - Errors - Authentication events - Database failures -
Queue failures

Never log: - Passwords - Tokens - Sensitive personal information

------------------------------------------------------------------------

# Repository Layer

Responsibilities: - Prisma queries - Transactions - Pagination -
Filtering - Sorting

Repositories must not contain business rules.

------------------------------------------------------------------------

# Service Layer

Responsibilities: - Business validation - Transactions - Domain rules -
Notifications - Audit events - Queue jobs

------------------------------------------------------------------------

# Background Jobs

Use BullMQ for:

-   Email delivery
-   Notification processing
-   Report generation
-   Scheduled reminders
-   Data imports

------------------------------------------------------------------------

# Caching

Redis cache for:

-   Master data
-   Dashboard summaries
-   Frequently accessed reports
-   User permissions

------------------------------------------------------------------------

# File Storage

Store files in object storage.

Database stores metadata only.

Supported: - Images - PDFs - Office documents

------------------------------------------------------------------------

# Transactions

Use Prisma transactions for:

-   Lead conversion
-   Order creation
-   Invoice generation
-   Payment recording

------------------------------------------------------------------------

# Security

-   Helmet
-   CORS
-   Rate Limiting
-   Input Sanitization
-   SQL Injection protection (Prisma)
-   CSRF protection where applicable

------------------------------------------------------------------------

# Configuration

Environment variables:

-   DATABASE_URL
-   REDIS_URL
-   JWT_SECRET
-   JWT_REFRESH_SECRET
-   STORAGE_ENDPOINT
-   STORAGE_BUCKET
-   SMTP_HOST
-   SMTP_USER
-   SMTP_PASSWORD

Never hardcode secrets.

------------------------------------------------------------------------

# Testing Strategy

Unit Tests: - Services - Utilities

Integration Tests: - Repositories - APIs

End-to-End Tests: - Authentication - Lead lifecycle - Order workflow -
Payment workflow

------------------------------------------------------------------------

# Monitoring

Health endpoints:

-   /health
-   /health/db
-   /health/cache

Metrics: - Response time - Queue depth - Error rate - Database latency

------------------------------------------------------------------------

# API Versioning

Base:

/api/v1

Future breaking changes require:

/api/v2

------------------------------------------------------------------------

# Implementation Order

1.  Authentication
2.  Organizations
3.  Users
4.  Roles & Permissions
5.  Leads
6.  Visits
7.  Customers
8.  Orders
9.  Invoices
10. Payments
11. Notifications
12. Reports
13. Settings

Each module must be fully tested before proceeding.

------------------------------------------------------------------------

# Claude Code Instructions

-   Generate one NestJS module at a time.
-   Reuse common DTOs and utilities.
-   Follow dependency injection.
-   Keep controllers thin.
-   Keep business rules in services.
-   Use repositories for all database access.
-   Generate Swagger annotations.
-   Maintain consistent response structures.
-   Do not introduce circular dependencies.
