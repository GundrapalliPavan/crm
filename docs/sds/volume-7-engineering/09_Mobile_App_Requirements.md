# Mobile Application Requirements

**Project:** CRM Platform\
**Document:** 09_Mobile_App_Requirements.md\
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the requirements, architecture, user experience,
and implementation guidelines for the CRM Mobile Application.

The mobile application is intended for field sales executives and
managers, sharing the same backend APIs as the CRM web application.

------------------------------------------------------------------------

# Technology Stack

-   Framework: React Native
-   Platform: Expo
-   Language: TypeScript
-   Navigation: Expo Router
-   State Management: TanStack Query
-   Forms: React Hook Form
-   Validation: Zod
-   HTTP Client: Axios
-   Notifications: Expo Notifications
-   Location: Expo Location
-   Camera: Expo Camera
-   File Uploads: Expo Image Picker
-   Secure Storage: Expo SecureStore

------------------------------------------------------------------------

# Target Users

-   Sales Executive
-   Sales Manager (optional in V1)

------------------------------------------------------------------------

# Core Objectives

The mobile app should allow users to:

-   Log in securely.
-   View assigned work.
-   Record customer visits.
-   Capture new leads.
-   Update lead status.
-   Create follow-up tasks.
-   View customer details.
-   Create orders.
-   View invoice/payment status.
-   Receive notifications.

------------------------------------------------------------------------

# Navigation

## Bottom Navigation

-   Dashboard
-   Leads
-   Visits
-   Orders
-   Profile

## Stack Navigation

-   Login
-   Lead Details
-   Visit Details
-   Customer Details
-   Order Details
-   Settings

------------------------------------------------------------------------

# Screens

## Authentication

-   Login
-   Forgot Password
-   Reset Password

## Dashboard

-   Today's Visits
-   Assigned Leads
-   Follow-ups
-   Pending Orders
-   Recent Activity

## Leads

-   Lead List
-   Lead Details
-   Create Lead
-   Edit Lead
-   Lead Timeline

## Site Visits

-   Visit List
-   Check-In
-   Check-Out
-   Visit Summary

## Customers

-   Customer List
-   Customer Profile

## Orders

-   Order List
-   Create Order
-   Order Details

## Billing

-   Invoice List (Read Only)
-   Payment Status (Read Only)

## Notifications

-   Notification List

## Profile

-   User Profile
-   Change Password
-   Logout

------------------------------------------------------------------------

# Site Visit Workflow

1.  Select assigned lead.
2.  Start visit.
3.  Capture GPS location.
4.  Record visit notes.
5.  Upload photos/documents (optional).
6.  Select visit outcome.
7.  Create follow-up if required.
8.  Complete visit.
9.  Sync data to CRM.

------------------------------------------------------------------------

# Lead Workflow

-   Create lead
-   Assign (Manager only)
-   Update status
-   Add notes
-   Schedule follow-up
-   Convert to customer (if permitted)

------------------------------------------------------------------------

# Order Workflow

-   Select customer
-   Add products
-   Review pricing
-   Submit order
-   View order status

------------------------------------------------------------------------

# Notifications

Receive push notifications for:

-   New lead assignments
-   Follow-up reminders
-   Order updates
-   Payment updates
-   System announcements

------------------------------------------------------------------------

# Offline Strategy

Version 1

-   Internet connection required for saving data.
-   Local caching for read-only screens.

Future

-   Offline lead creation
-   Offline visit recording
-   Background synchronization

------------------------------------------------------------------------

# Permissions

The app requires:

-   Location
-   Camera
-   Photo Library
-   Push Notifications

Permissions should be requested only when needed.

------------------------------------------------------------------------

# Security

-   JWT Authentication
-   Refresh Token
-   Secure Token Storage
-   Automatic Session Expiry
-   API Authorization
-   HTTPS Only

------------------------------------------------------------------------

# API Usage

The mobile application consumes the same REST APIs as the web
application.

No mobile-specific business logic should exist on the server.

------------------------------------------------------------------------

# Performance

-   App launch under 3 seconds
-   Cached dashboard data
-   Optimistic UI where appropriate
-   Image compression before upload

------------------------------------------------------------------------

# Error Handling

Provide user-friendly handling for:

-   Network failures
-   Validation errors
-   Session expiration
-   GPS unavailable
-   Camera unavailable
-   File upload failures

------------------------------------------------------------------------

# Testing

-   Unit Tests
-   Component Tests
-   API Integration Tests
-   Device Testing (Android & iOS)

------------------------------------------------------------------------

# Release Strategy

Version 1

-   Authentication
-   Dashboard
-   Leads
-   Visits
-   Orders
-   Notifications
-   Profile

Version 2

-   Offline Mode
-   Customer Digital Signature
-   Barcode/QR Scanning
-   Advanced Analytics

------------------------------------------------------------------------

# Claude Code Instructions

-   Build using Expo Router.
-   Reuse backend REST APIs.
-   Keep UI responsive and touch-friendly.
-   Separate presentation, hooks, and services.
-   Use TanStack Query for server state.
-   Validate forms using Zod.
-   Minimize API calls through caching.
