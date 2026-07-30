MOBILE_PRD.md

Electrical Distribution CRM — Mobile Application (Field Sales)

Version: 1.0
Status: Product Definition
Document Type: Product Requirements
Related Documents: PROJECT.md, docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md

⸻

1. Purpose

This document defines the product requirements for the future native mobile application described in PROJECT.md sections 33–43 ("Future Mobile Application").

PROJECT.md remains the authority on product vision and future direction. This document exists to turn that section into something buildable: concrete users, screens, workflows, and release scope.

Do not begin mobile implementation from this document alone. Follow MOBILE_ARCHITECTURE.md for the technical plan, and CLAUDE.md's Understand → Inspect → Plan → Implement → Verify → Report → Stop process for how work should proceed once building starts.

⸻

2. Relationship to the Web Application

The mobile application is a second client of the same platform, not a separate product.

It shares:

* The same backend API
* The same PostgreSQL database
* The same business rules, validation, and permissions
* The same user accounts, roles, and organization/branch boundaries

It does not:

* Reproduce the full web CRM
* Introduce mobile-only business logic
* Maintain its own copy of business rules

If a rule needs to change (a validation, a status transition, a permission), it changes once, in the backend, and both clients pick it up.

⸻

3. Product Vision

Give field-based sales staff a fast, focused tool for the work they actually do outside the office: visiting customers, working leads by phone, quoting on the spot, and knowing what is owed.

The mobile app should feel like a companion to the day's work, not a smaller version of the desktop CRM. A field executive should be able to open the app between visits, see exactly what needs attention, act on it, and move on.

⸻

4. Target Users

Primary:

* Field Sales Executive — visits customers/dealers, works leads, creates quotations, checks stock and pricing
* Telecaller — works leads and follow-ups by phone, does not travel

Secondary (V1-optional, confirm before building):

* Sales Manager — approvals and team visibility on the move
* Sales Executive (desk-based) — may still prefer mobile for quick lookups between calls

Explicitly not targeted in V1:

* Inventory Manager, Purchase Manager, Billing User, Administrator — these roles' work is administration-heavy and stays web-first per PROJECT.md section 43 and CLAUDE.md section 14.

⸻

5. Product Principle

Every mobile screen should follow:

See → Act → Update → Move On

Concretely:

* Minimize typing — prefer selection, voice notes, and photos over long text entry
* Minimize navigation depth — the common path from "open app" to "task done" should be 2–3 taps
* Surface only what needs action today, not the full historical record
* Defer complex administration, bulk operations, configuration, and advanced reporting to the web app

⸻

6. Core Objectives

The mobile app must let a field user:

* Log in securely and stay logged in across sessions
* See what needs attention today (visits, leads, follow-ups, orders)
* Create and update leads
* Record a customer/dealer visit, including outcome and next steps
* Look up products, pricing, and stock availability
* Create and share a quotation
* View order status
* View invoice and payment status for their customers (read-only)
* Receive timely notifications for things that need a response
* Manage their own profile and password

⸻

7. Modules & Screens (V1)

7.1 Authentication

* Login
* Forgot Password
* Reset Password

7.2 Dashboard

* Today's Visits
* Assigned Leads
* Follow-ups Due
* Pending Orders
* Recent Activity

The dashboard is the "start here" screen — it should answer "what do I need to do right now" without the user having to navigate anywhere first, matching the same intent as the web Dashboard (PROJECT.md's action-oriented home page).

7.3 Leads

* Lead List (assigned to me, filterable by status)
* Lead Details
* Create Lead
* Edit Lead
* Lead Timeline (status changes, notes, follow-ups, communications)

Workflow: create → update status → add notes → schedule follow-up → convert (if permitted by role).

7.4 Site Visits

* Visit List (planned + completed)
* Check-In
* Check-Out
* Visit Summary

Workflow, in order:

1. Select the lead, contact, or company being visited
2. Start visit (check-in, GPS-assisted where available)
3. Record visit notes (text and/or voice note)
4. Optionally attach photos or documents
5. Select a visit outcome (e.g. interested, order placed, follow-up needed, not interested)
6. Create a follow-up if the outcome requires one
7. Check out, completing the visit
8. Visit syncs to the CRM and becomes visible on the web app's history for that record

This is the module most likely to require a real product decision before engineering starts — see MOBILE_ARCHITECTURE.md section on data model gaps. There is currently no dedicated "visit" concept in the CRM; the closest existing entity is a Follow-up.

7.5 Customers & Dealers

* Customer/Dealer List (search)
* Customer/Dealer Profile — contact info, outstanding balance, recent orders, recent quotations, previous visits, communication history

Read-focused. Creating/editing a Company or Contact from mobile is in scope only if field feedback shows it's a frequent need; not assumed for V1.

7.6 Sales

* Product Search / Catalogue
* Price Lookup
* Stock Availability (read-only, by warehouse if relevant to the user's territory)
* Create Quotation
* View Quotation
* Share Quotation (PDF/link, via WhatsApp or email — reusing the existing Communication infrastructure, not a new channel)
* View Orders

Quotation approval, discount approval, and order confirmation remain workflows the backend already gates by permission — the mobile app enforces nothing extra, it just respects what the API already returns.

7.7 Billing (Read Only)

* Invoice List
* Payment Status

No payment recording from mobile in V1. PROJECT.md's mobile "Collections" workflows (recording a collection activity, uploading payment proof) are a deliberate V2+ candidate, not V1 — see section 12.

7.8 Notifications

* Notification List (mirrors the existing in-app notification feed, delivered as push where the OS allows it)

7.9 Profile

* User Profile
* Change Password
* Logout (and "log out of all devices", reusing the existing capability)

⸻

8. Device Capabilities Used

* Camera — visit photos, document capture
* Photo Library — attaching existing images
* Location — check-in/check-out GPS
* Microphone — voice notes on visits
* Phone Dialer — call a lead/contact directly from their record
* Push Notifications — lead assignment, follow-up reminders, order/payment updates

Permissions are requested only at the point of use, never all at once at first launch (PROJECT.md section 41).

⸻

9. Notifications

Push notifications should cover, at minimum:

* New lead assigned to me
* Follow-up due/overdue
* Quotation approved or rejected
* Order status change
* Payment recorded against my customer
* System announcements (rare, admin-triggered)

These map directly onto the domain events the backend notification system already fires for the web app (lead assignment, quotation/purchase-order submission, payment recording, low-stock) — mobile push is a second delivery channel for the same events, not a new notification model. See MOBILE_ARCHITECTURE.md.

⸻

10. Offline Usage

Version 1: online-only for writes. Read-only screens (today's visits, assigned leads, customer info) may cache the last-loaded data for brief connectivity gaps, but creating or editing anything requires a live connection.

Future (not V1): offline lead creation, offline visit recording with background sync, and a defined conflict-resolution rule for anything edited offline and online at the same time.

Do not build offline-first architecture into V1. It adds real complexity (local persistence, conflict resolution, sync queues) that PROJECT.md explicitly defers ("The entire CRM does not need to work offline... introduced selectively based on practical need").

⸻

11. Explicitly Out of Scope for V1

* Bulk operations of any kind
* System configuration (roles, permissions, templates, application settings)
* Advanced reporting/analytics beyond what's needed for the user's own dashboard
* Purchase, Inventory adjustment/transfer, Team management, Audit — all stay web-only
* Payment recording/collections
* Offline writes
* Digital signature capture
* Barcode/QR scanning

Anything in this list that later proves necessary should go through the same product-definition step this document represents — not get added ad hoc during implementation (CLAUDE.md section 6, Scope Discipline).

⸻

12. Release Plan

V1

* Authentication
* Dashboard
* Leads
* Site Visits
* Customers & Dealers (read)
* Sales (product lookup, quotations, orders — read/create per permission)
* Billing (read-only)
* Notifications
* Profile

V2 (candidates, not committed)

* Offline mode (lead creation, visit recording, background sync)
* Collections (record collection activity, payment proof upload)
* Customer digital signature capture
* Barcode/QR scanning (product lookup at a customer site)
* Advanced analytics on the mobile dashboard

⸻

13. Success Criteria

The mobile app is working as intended if a Field Sales Executive can, without touching a laptop:

* Start their day knowing exactly which visits and follow-ups are due
* Log a complete visit (notes, outcome, next step) in under two minutes
* Quote a customer on the spot and share it before leaving
* Know a customer's outstanding balance before or during a visit
* Get notified promptly when a quotation they submitted is approved or rejected

⸻

14. Open Product Questions

These should be resolved before or during MOBILE_ARCHITECTURE.md's data-model decisions, not discovered mid-build:

* Is Sales Manager in scope for V1, or deferred? (docs/sds marks this "optional in V1".)
* Does a "visit" need to be its own tracked concept distinct from a Follow-up, with its own history separate from follow-up history on a Lead/Company/Contact? Product answer drives a real schema decision.
* Should Field Sales Executive be allowed to create a Company/Contact from mobile, or only search existing ones? (Currently assumed read-only in section 7.5 — confirm.)
* What counts as "my customers" for the Billing (read-only) screen — owned leads/companies, team membership, or both? This determines the visibility rule, not just the UI.

⸻
