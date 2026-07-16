# RBAC Roles & Permissions

**Project:** CRM Platform **Document:** 10_RBAC_Roles_Permissions.md
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the Role-Based Access Control (RBAC) model for the
CRM Platform. It is the single source of truth for backend
authorization, frontend visibility, and mobile application permissions.

------------------------------------------------------------------------

# RBAC Principles

-   Every user belongs to exactly one Organization.
-   Every user has one or more Roles.
-   Roles contain Permissions.
-   Permissions are evaluated on every protected request.
-   Users cannot access data belonging to another Organization.

------------------------------------------------------------------------

# Standard Roles

1.  Super Admin
2.  Organization Admin
3.  Sales Manager
4.  Sales Executive
5.  Finance Executive
6.  Viewer

------------------------------------------------------------------------

# Permission Types

-   View
-   Create
-   Update
-   Delete
-   Assign
-   Approve
-   Convert
-   Export
-   Import
-   Generate
-   Record Payment
-   Configure

------------------------------------------------------------------------

# Data Scope

-   Own Records
-   Team Records
-   Organization Records
-   System Wide (Super Admin only)

------------------------------------------------------------------------

# Permission Matrix

  ----------------------------------------------------------------------------------------
  Module      Action      Super      Org      Sales       Sales         Finance   Viewer
                          Admin      Admin    Manager     Executive               
  ----------- ----------- ---------- -------- ----------- ------------- --------- --------
  Dashboard   View        ✓          ✓        ✓           ✓             ✓         ✓

  Users       CRUD        ✓          ✓        \-          \-            \-        \-

  Roles       CRUD        ✓          ✓        \-          \-            \-        \-

  Leads       View        ✓          ✓        Team        Own           View      View

  Leads       Create      ✓          ✓        ✓           ✓             \-        \-

  Leads       Update      ✓          ✓        Team        Own           \-        \-

  Leads       Delete      ✓          ✓        Team        \-            \-        \-

  Leads       Assign      ✓          ✓        ✓           \-            \-        \-

  Leads       Convert     ✓          ✓        ✓           \-            \-        \-

  Visits      View        ✓          ✓        Team        Own           View      View

  Visits      Create      ✓          ✓        ✓           ✓             \-        \-

  Orders      View        ✓          ✓        Team        Own           View      View

  Orders      Create      ✓          ✓        ✓           ✓             \-        \-

  Orders      Update      ✓          ✓        Team        Own           \-        \-

  Billing     View        ✓          ✓        View        View          Full      View

  Billing     Generate    ✓          ✓        \-          \-            ✓         \-
              Invoice                                                             

  Billing     Record      ✓          ✓        \-          \-            ✓         \-
              Payment                                                             

  Reports     View        ✓          ✓        Team        Own           Finance   View

  Settings    Configure   ✓          ✓        \-          \-            \-        \-
  ----------------------------------------------------------------------------------------

------------------------------------------------------------------------

# Backend Authorization

Use NestJS Guards.

Checks:

1.  Authenticated user
2.  Organization ownership
3.  Required role
4.  Required permission
5.  Resource ownership (Own/Team/Organization)

------------------------------------------------------------------------

# Frontend Authorization

-   Hide unauthorized menus.
-   Hide unauthorized buttons.
-   Prevent unauthorized routes.
-   Prevent API calls without permission.
-   Display "Access Denied" page when necessary.

------------------------------------------------------------------------

# Mobile Permissions

Sales Executive:

-   Login
-   View assigned leads
-   Create visits
-   Update own leads
-   Create orders
-   View invoices
-   View payment status

Managers additionally:

-   Assign leads
-   View team activity
-   Team dashboards

------------------------------------------------------------------------

# Permission Naming Convention

Examples:

-   users.view

-   users.create

-   users.update

-   users.delete

-   leads.view

-   leads.create

-   leads.assign

-   leads.convert

-   orders.create

-   invoices.generate

-   payments.record

------------------------------------------------------------------------

# Database Design

Tables:

-   roles
-   permissions
-   role_permissions
-   user_roles

Avoid hardcoded permissions in application logic.

------------------------------------------------------------------------

# Audit Requirements

Log permission-sensitive events:

-   User login
-   Role assignment
-   Permission changes
-   Lead assignment
-   Lead conversion
-   Invoice generation
-   Payment recording
-   Settings updates

------------------------------------------------------------------------

# Future Support

Architecture should allow:

-   Custom roles
-   Organization-specific permissions
-   Temporary permissions
-   Feature flags
-   Approval workflows

------------------------------------------------------------------------

# Claude Code Instructions

-   Implement RBAC through NestJS Guards.
-   Store permissions in the database.
-   Use permission middleware on APIs.
-   Render frontend based on permissions.
-   Reuse the same permission keys across backend, frontend, and mobile.
-   Never hardcode role names in business logic.
