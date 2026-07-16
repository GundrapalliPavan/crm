# UI Component Specification

**Project:** CRM Platform **Document:** 11_UI_Component_Specification.md
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the reusable UI component library, design system
standards, and interaction patterns for the CRM Platform.

The goal is to ensure all web modules share a consistent user experience
and that Claude Code reuses components instead of generating new ones
for every screen.

------------------------------------------------------------------------

# Design Principles

-   Consistency over creativity
-   Responsive-first
-   Accessible (WCAG AA)
-   Keyboard friendly
-   Reusable components
-   Progressive disclosure
-   Minimal clicks for common actions

------------------------------------------------------------------------

# Design Tokens

## Colors

-   Primary
-   Secondary
-   Success
-   Warning
-   Error
-   Info
-   Neutral

## Typography

-   Heading 1--6
-   Body Large
-   Body
-   Caption
-   Label
-   Button

## Spacing

4px grid system

## Radius

-   Small
-   Medium
-   Large

------------------------------------------------------------------------

# Layout Components

-   App Shell
-   Header
-   Sidebar
-   Breadcrumb
-   Page Header
-   Section Header
-   Content Container
-   Footer

------------------------------------------------------------------------

# Navigation Components

-   Sidebar Navigation
-   Top Navigation
-   Tabs
-   Stepper
-   Pagination
-   Command Palette (future)

------------------------------------------------------------------------

# Form Components

## Inputs

-   Text Input
-   Email Input
-   Password Input
-   Phone Input
-   Number Input
-   Currency Input
-   URL Input

## Selectors

-   Select
-   Multi Select
-   Autocomplete
-   Radio Group
-   Checkbox
-   Toggle Switch

## Date & Time

-   Date Picker
-   Date Range Picker
-   Time Picker

## Upload

-   File Upload
-   Image Upload
-   Drag & Drop Upload

------------------------------------------------------------------------

# Data Display

## Tables

Every table supports:

-   Search
-   Sort
-   Pagination
-   Filters
-   Column visibility
-   Export
-   Bulk selection
-   Row actions

## Cards

-   Metric Card
-   Summary Card
-   Profile Card
-   Status Card

## Lists

-   Activity Timeline
-   Notification List
-   Audit Log
-   Comments

## Indicators

-   Badge
-   Chip
-   Progress Bar
-   Status Pill

------------------------------------------------------------------------

# Dashboard Widgets

-   KPI Card
-   Revenue Chart
-   Lead Funnel
-   Order Summary
-   Payment Summary
-   Recent Activity
-   Upcoming Follow-ups
-   Team Performance

------------------------------------------------------------------------

# Feedback Components

-   Toast
-   Alert
-   Banner
-   Confirmation Dialog
-   Modal
-   Drawer
-   Empty State
-   Skeleton Loader
-   Loading Spinner
-   Error State

------------------------------------------------------------------------

# CRUD Patterns

Every module follows:

1.  List
2.  Detail
3.  Create
4.  Edit
5.  Delete Confirmation

Avoid unique CRUD experiences between modules.

------------------------------------------------------------------------

# Search & Filtering

Global Search

Supports:

-   Leads
-   Customers
-   Orders
-   Users

Advanced Filters

-   Status
-   Owner
-   Date Range
-   Source
-   Priority

Saved Filters should be supported in future.

------------------------------------------------------------------------

# Tables

Standard Columns

-   ID
-   Name
-   Status
-   Owner
-   Created Date
-   Updated Date
-   Actions

Row Actions

-   View
-   Edit
-   Delete
-   Duplicate
-   Export

------------------------------------------------------------------------

# Forms

Every form includes:

-   Required indicators
-   Inline validation
-   Server validation
-   Loading state
-   Success state
-   Error state
-   Cancel confirmation

------------------------------------------------------------------------

# Responsive Behaviour

Desktop

-   Full sidebar
-   Multi-column layouts

Tablet

-   Collapsible sidebar

Mobile

-   Drawer navigation
-   Single-column layouts
-   Sticky actions

------------------------------------------------------------------------

# Accessibility

-   Semantic HTML
-   Keyboard navigation
-   Focus management
-   ARIA labels
-   Color contrast
-   Screen reader support

------------------------------------------------------------------------

# Icons

Use Lucide icons consistently.

Do not mix icon libraries.

------------------------------------------------------------------------

# Empty States

Every module must define:

-   No data
-   No search results
-   No permissions
-   Error loading
-   Offline (future)

Each state should include:

-   Illustration
-   Message
-   CTA

------------------------------------------------------------------------

# Component Folder Structure

``` text
components/
├── layout/
├── navigation/
├── forms/
├── tables/
├── cards/
├── charts/
├── feedback/
├── dialogs/
├── indicators/
├── upload/
└── common/
```

------------------------------------------------------------------------

# Naming Convention

Examples

-   DataTable
-   LeadForm
-   CustomerCard
-   StatusBadge
-   ConfirmDialog
-   PageHeader

------------------------------------------------------------------------

# Claude Code Instructions

-   Reuse components before creating new ones.
-   Use shadcn/ui as the base component library.
-   Keep components presentation-focused.
-   Move business logic into hooks and services.
-   All modules must use the same CRUD, table, and form patterns.
-   Do not duplicate component implementations.
