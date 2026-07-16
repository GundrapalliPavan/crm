# Claude Project Guidelines

**Project:** CRM Platform **Document:** 13_Claude_Project_Guidelines.md
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document is the master operating guide for Claude Code when
implementing the CRM Platform.

Its purpose is to ensure that all generated code follows the agreed
architecture, standards, and implementation order.

------------------------------------------------------------------------

# Source of Truth Priority

If multiple documents contain overlapping information, use this
precedence:

1.  Product Requirements (01)
2.  Database Design (02)
3.  ER Diagram (03)
4.  PostgreSQL Schema (04)
5.  Prisma Schema (05)
6.  API Specification (06)
7.  Backend Architecture (07)
8.  Frontend Architecture (08)
9.  Mobile Requirements (09)
10. RBAC (10)
11. UI Component Specification (11)
12. Coding Standards (12)
13. This document (13)

Do not invent functionality outside these documents.

------------------------------------------------------------------------

# General Rules

-   Implement only approved features.
-   Do not introduce unnecessary libraries.
-   Do not redesign the architecture.
-   Prefer reusable components.
-   Keep implementations modular.
-   Favor readability and maintainability.
-   Ask for clarification instead of guessing when requirements
    conflict.

------------------------------------------------------------------------

# Implementation Order

Complete each phase before moving to the next.

Phase 1 - Project scaffold - Configuration - Environment - Prisma -
PostgreSQL - Authentication

Phase 2 - Organizations - Users - Roles - Permissions

Phase 3 - Leads - Visits - Customers

Phase 4 - Products - Orders - Invoices - Payments

Phase 5 - Reports - Notifications - Settings

Phase 6 - Mobile integration - Performance optimization - Testing -
Deployment

Never skip dependencies.

------------------------------------------------------------------------

# Module Completion Rules

A module is complete only if it includes:

-   Database migration
-   Prisma model
-   DTOs
-   Repository
-   Service
-   Controller
-   Validation
-   Authorization
-   Swagger documentation
-   Unit tests
-   Integration tests
-   Frontend pages
-   API integration
-   Loading, empty and error states

------------------------------------------------------------------------

# Backend Rules

-   Use NestJS modules.
-   Thin controllers.
-   Rich services.
-   Repository pattern.
-   Dependency injection.
-   Prisma only for database access.
-   Never place business logic in controllers.

------------------------------------------------------------------------

# Frontend Rules

-   Next.js App Router.
-   TypeScript strict mode.
-   TanStack Query for server state.
-   React Hook Form + Zod.
-   Reuse UI components.
-   Respect RBAC in navigation and actions.

------------------------------------------------------------------------

# Mobile Rules

-   Expo Router.
-   Shared REST APIs.
-   No mobile-specific backend endpoints unless approved.
-   Optimize for touch interactions.
-   Use secure storage for tokens.

------------------------------------------------------------------------

# Database Rules

-   UUID primary keys.
-   Foreign keys required.
-   Soft deletes.
-   Indexed foreign keys.
-   Feature-based migrations.
-   Never modify applied production migrations.

------------------------------------------------------------------------

# API Rules

-   REST only.
-   Versioned under /api/v1.
-   Standard response envelope.
-   DTO validation.
-   Consistent error responses.

------------------------------------------------------------------------

# Security Rules

-   JWT authentication.
-   Refresh token rotation.
-   RBAC enforcement.
-   Multi-tenant isolation.
-   Input validation.
-   Secrets from environment variables only.

------------------------------------------------------------------------

# Testing Requirements

Every completed feature must include:

-   Unit tests
-   Integration tests
-   End-to-end verification for critical workflows

Target minimum coverage: 80%.

------------------------------------------------------------------------

# Git Workflow

-   Small, focused commits.
-   One feature per branch.
-   Descriptive commit messages.
-   No unrelated changes in the same pull request.

------------------------------------------------------------------------

# Documentation Rules

Update documentation whenever:

-   Database changes
-   API changes
-   Business rules change
-   UI workflow changes

Documentation must stay synchronized with implementation.

------------------------------------------------------------------------

# Refactoring Rules

-   Refactor only when it improves maintainability.
-   Preserve public APIs unless explicitly approved.
-   Do not duplicate logic.
-   Extract shared utilities where appropriate.

------------------------------------------------------------------------

# Definition of Done

Before marking any module complete:

-   Builds successfully.
-   No lint errors.
-   No TypeScript errors.
-   Tests pass.
-   Swagger updated.
-   Documentation updated.
-   RBAC enforced.
-   Audit logging implemented where required.
-   Responsive UI verified.
-   Accessibility basics verified.

------------------------------------------------------------------------

# When to Ask for Clarification

Stop and request clarification if:

-   Requirements conflict.
-   Business rules are ambiguous.
-   A feature affects database design.
-   Security implications are unclear.
-   A requested change impacts multiple modules.

Never make major architectural assumptions.

------------------------------------------------------------------------

# Expected Deliverables

For every module generate:

-   Database migration
-   Prisma updates
-   Backend implementation
-   Frontend implementation
-   Tests
-   Documentation

------------------------------------------------------------------------

# Final Objective

Produce production-ready code that adheres to the approved architecture,
is easy to maintain, and minimizes future refactoring.

Quality is more important than speed.
