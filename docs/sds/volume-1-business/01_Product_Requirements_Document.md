# CRM Product Requirements Document (PRD)

**Version:** 1.0\
**Project Name:** CRM Platform\
**Document Status:** Draft

------------------------------------------------------------------------

# 1. Product Overview

## Purpose

The CRM Platform is a web-based application designed to help
organizations manage their sales lifecycle, customer interactions,
orders, billing, and team activities from a centralized platform.

A companion mobile application will be provided for field sales
executives, allowing them to perform site visits, capture leads, update
visit information, and synchronize data with the CRM in real time.

------------------------------------------------------------------------

# 2. Business Objectives

The platform should enable organizations to:

-   Manage leads from inquiry to conversion.
-   Track field sales activities.
-   Assign work among sales teams.
-   Monitor sales performance.
-   Manage customer orders.
-   Track invoices and payments.
-   Provide role-based access to users.
-   Maintain complete activity history.
-   Generate business reports.

------------------------------------------------------------------------

# 3. Target Users

  -----------------------------------------------------------------------
  User Type                          Description
  ---------------------------------- ------------------------------------
  Super Admin                        System owner with complete access.

  Admin                              Organization administrator
                                     responsible for users, settings, and
                                     configuration.

  Sales Manager                      Manages sales executives, assigns
                                     leads, reviews performance.

  Sales Executive                    Performs field visits, creates and
                                     updates leads, records visit
                                     outcomes.

  Finance Executive                  Manages invoices, payments, and
                                     financial records.

  Viewer (Optional)                  Read-only access to selected
                                     modules.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Product Modules

## 4.1 Authentication

-   Login
-   Logout
-   Forgot Password
-   Reset Password
-   Change Password
-   Session Management
-   User Profile

## 4.2 Dashboard

-   Lead Summary
-   Order Summary
-   Revenue Summary
-   Pending Payments
-   Today's Follow-ups
-   Sales Performance
-   Team Activity
-   Recent Notifications

## 4.3 User & Team Management

-   Create/Edit/Deactivate/Delete Users
-   Teams
-   Departments (Optional)
-   Roles
-   Permissions
-   User Assignment
-   Activity Logs

## 4.4 Lead Management

-   Create, Edit, Delete Leads
-   Assign Lead
-   Lead Status
-   Lead Source
-   Follow-up Scheduling
-   Notes
-   Attachments
-   Visit History
-   Lead Timeline
-   Search & Filters

## 4.5 Site Visit Management

-   Create Visit
-   Check-in / Check-out
-   Visit Location
-   Visit Notes
-   Meeting Outcome
-   Follow-up Date
-   Upload Images/Documents
-   GPS Coordinates (Optional in V1)

## 4.6 Customer Management

-   Customer Profile
-   Contact Persons
-   Addresses
-   Communication History
-   Active Orders
-   Billing History

## 4.7 Order Management

-   Create/Edit Orders
-   Order Status
-   Product/Service Details
-   Quantity
-   Pricing
-   Discounts
-   Taxes
-   Order Documents
-   Order Timeline

## 4.8 Billing & Finance

-   Generate Invoice
-   Record Payment
-   Payment Status
-   Outstanding Balance
-   Payment History
-   Receipt Generation
-   Revenue Summary

## 4.9 Notifications

-   Assignment Notifications
-   Follow-up Reminders
-   Payment Alerts
-   System Notifications

## 4.10 Reports

-   Lead Reports
-   Sales Reports
-   Revenue Reports
-   Outstanding Payments
-   User Performance
-   Visit Reports

## 4.11 Settings

-   Company Profile
-   Users
-   Roles
-   Lead Status Master
-   Lead Source Master
-   Tax Configuration
-   Payment Methods

------------------------------------------------------------------------

# 5. Mobile Application Scope

The mobile application is intended exclusively for field sales
executives.

Features:

-   Login
-   Dashboard
-   Assigned Leads
-   Site Visit Entry
-   Customer Details
-   Lead Status Update
-   Follow-up Creation
-   Order Creation
-   Payment Status View
-   Notifications
-   Profile

The mobile application will use the same backend APIs as the CRM.

------------------------------------------------------------------------

# 6. User Roles & Permissions

  ------------------------------------------------------------------------------
  Module      Super Admin   Admin   Sales Manager   Sales Executive   Finance
  ----------- ------------- ------- --------------- ----------------- ----------
  Dashboard   ✓             ✓       ✓               ✓                 ✓

  Users       ✓             ✓       View            No                No

  Leads       ✓             ✓       ✓               Assigned Only     View

  Visits      ✓             ✓       ✓               Own Only          View

  Orders      ✓             ✓       ✓               Assigned          View

  Billing     ✓             ✓       View            View              Full

  Reports     ✓             ✓       Team            Own               Finance

  Settings    ✓             ✓       No              No                No
  ------------------------------------------------------------------------------

------------------------------------------------------------------------

# 7. Business Rules

-   Every lead belongs to one organization.
-   Every lead has one owner (Sales Executive).
-   A lead can have multiple visits.
-   A visit can generate follow-up tasks.
-   A lead can be converted into a customer.
-   A customer can have multiple orders.
-   An order can have one or more invoices.
-   An invoice can have multiple payments.
-   Every financial transaction must be auditable.
-   Soft delete should be used for business records.

------------------------------------------------------------------------

# 8. Non-Functional Requirements

## Performance

-   Support up to 10,000 active leads.
-   Dashboard response under 3 seconds.

## Security

-   JWT Authentication
-   Password Hashing
-   Role-Based Access Control
-   Audit Logging
-   HTTPS Only

## Scalability

-   Multi-tenant ready
-   Modular backend
-   Shared REST APIs for Web & Mobile

------------------------------------------------------------------------

# 9. Out of Scope (Version 1)

-   AI Lead Scoring
-   WhatsApp Integration
-   Email Marketing
-   Marketing Automation
-   Inventory Management
-   Purchase Management
-   Accounting / General Ledger
-   Multi-language Support
-   Offline Mobile Synchronization
-   ERP Integrations

------------------------------------------------------------------------

# 10. Success Criteria

Users should be able to:

-   Log in securely.
-   Manage users and permissions.
-   Create and manage leads.
-   Record site visits.
-   Convert leads into customers.
-   Create and track orders.
-   Generate invoices.
-   Record payments.
-   View dashboards and reports.
-   Use the mobile application for field sales activities.

------------------------------------------------------------------------

# Appendix A -- Master Data Definitions

## Lead Status

-   New
-   Contacted
-   Qualified
-   Proposal Sent
-   Negotiation
-   Won
-   Lost

## Lead Sources

-   Website
-   Referral
-   Walk-in
-   Campaign
-   Cold Call
-   Social Media
-   Partner

## Order Status

-   Draft
-   Confirmed
-   Processing
-   Completed
-   Cancelled

## Payment Status

-   Pending
-   Partially Paid
-   Paid
-   Overdue
-   Refunded

## Default Roles

-   Super Admin
-   Admin
-   Sales Manager
-   Sales Executive
-   Finance Executive
-   Viewer
