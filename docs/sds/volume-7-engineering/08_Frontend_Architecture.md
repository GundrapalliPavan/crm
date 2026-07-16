# Frontend Architecture

**Project:** CRM Platform\
**Document:** 08_Frontend_Architecture.md\
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the frontend architecture, UI standards,
application structure, and implementation guidelines for the CRM
Platform.

The frontend must be scalable, responsive, accessible, and maintainable
while sharing the same design system across all modules.

------------------------------------------------------------------------

# Technology Stack

-   Framework: Next.js (App Router)
-   Language: TypeScript
-   Styling: Tailwind CSS
-   UI Library: shadcn/ui
-   Icons: Lucide
-   Forms: React Hook Form
-   Validation: Zod
-   Server State: TanStack Query
-   Charts: Recharts
-   Tables: TanStack Table
-   HTTP Client: Axios
-   Notifications: Sonner
-   Authentication: JWT

------------------------------------------------------------------------

# Architecture Principles

-   Feature-first folder structure
-   Reusable components
-   Server state separated from UI state
-   Responsive by default
-   Accessibility (WCAG AA)
-   Type-safe forms
-   No business logic inside UI components

------------------------------------------------------------------------

# Project Structure

``` text
frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── common/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── layouts/
│   └── feedback/
├── features/
│   ├── auth/
│   ├── users/
│   ├── leads/
│   ├── visits/
│   ├── customers/
│   ├── orders/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   └── settings/
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

------------------------------------------------------------------------

# Layouts

## Public

-   Login
-   Forgot Password
-   Reset Password

## Dashboard

-   Header
-   Sidebar
-   Breadcrumbs
-   Content Area
-   Footer

------------------------------------------------------------------------

# Navigation

Primary Navigation

-   Dashboard
-   Leads
-   Customers
-   Visits
-   Orders
-   Billing
-   Reports
-   Settings

Navigation visibility must respect user permissions.

------------------------------------------------------------------------

# State Management

## Server State

Managed using TanStack Query.

Examples:

-   Lead List
-   Orders
-   Reports
-   Dashboard Metrics

## Local UI State

Managed with React state.

Examples:

-   Dialogs
-   Filters
-   Selected Rows
-   Wizards

------------------------------------------------------------------------

# API Layer

All API calls must go through a centralized client.

Responsibilities:

-   JWT injection
-   Token refresh
-   Error handling
-   Retry policy
-   Response normalization

------------------------------------------------------------------------

# Form Standards

Use:

-   React Hook Form
-   Zod validation

Every form must include:

-   Client validation
-   Server validation
-   Loading state
-   Success feedback
-   Error feedback

------------------------------------------------------------------------

# Reusable Components

## Inputs

-   Text Input
-   Textarea
-   Select
-   Multi Select
-   Date Picker
-   Date Range
-   Number Input
-   Currency Input
-   Phone Input
-   File Upload

## Display

-   Cards
-   Tables
-   Badges
-   Timeline
-   Empty State
-   Skeleton Loader
-   Charts

## Feedback

-   Toast
-   Modal
-   Drawer
-   Confirm Dialog
-   Alert Banner

------------------------------------------------------------------------

# Tables

Standard features:

-   Pagination
-   Sorting
-   Filtering
-   Search
-   Export
-   Bulk Actions
-   Column Visibility

------------------------------------------------------------------------

# Permissions

Components must respect RBAC.

Example:

``` text
CanCreateLead
CanEditLead
CanDeleteLead
CanViewBilling
```

Unauthorized actions should be hidden, not merely disabled.

------------------------------------------------------------------------

# Dashboard

Widgets:

-   Lead Summary
-   Sales Summary
-   Orders
-   Revenue
-   Pending Payments
-   Follow-ups
-   Recent Activity

Widgets should be configurable in future versions.

------------------------------------------------------------------------

# Responsive Design

Support:

-   Desktop
-   Tablet
-   Mobile

Breakpoints should use Tailwind defaults.

------------------------------------------------------------------------

# Accessibility

-   Keyboard navigation
-   Screen reader labels
-   Visible focus states
-   Semantic HTML
-   Color contrast compliance

------------------------------------------------------------------------

# Performance

-   Lazy loading
-   Dynamic imports
-   Route-level code splitting
-   Image optimization
-   Query caching
-   Virtualized tables for large datasets

------------------------------------------------------------------------

# Error Handling

Display:

-   Inline validation
-   Global error page
-   Empty states
-   Network retry messages
-   Permission denied page

------------------------------------------------------------------------

# Testing

Use:

-   Jest
-   React Testing Library
-   Playwright (E2E)

Test:

-   Forms
-   Navigation
-   Permissions
-   API integration
-   Responsive layouts

------------------------------------------------------------------------

# Folder Standards

Every feature should contain:

``` text
feature/
├── components/
├── hooks/
├── pages/
├── services/
├── schemas/
├── types/
└── index.ts
```

------------------------------------------------------------------------

# Implementation Order

1.  Authentication
2.  Dashboard Layout
3.  Design System
4.  Users
5.  Leads
6.  Visits
7.  Customers
8.  Orders
9.  Billing
10. Reports
11. Settings

------------------------------------------------------------------------

# Claude Code Instructions

-   Use App Router.
-   Generate strongly typed components.
-   Reuse shared components.
-   Do not duplicate forms or tables.
-   Keep business logic in hooks/services.
-   Use TanStack Query for all server state.
-   Validate forms with Zod.
-   Follow responsive-first design.
