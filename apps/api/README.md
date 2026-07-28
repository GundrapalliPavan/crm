# CRM Platform - API

NestJS + TypeScript API for the CRM Platform.

See [`BACKEND.md`](../../prompts/BACKEND.md) and [`PROJECT_SETUP.md`](../../PROJECT_SETUP.md) for the full architecture specification.

## Stack

- NestJS 11 (TypeScript, strict mode)
- Prisma ORM (PostgreSQL) - schema lives at [`prisma/schema.prisma`](prisma/schema.prisma)
- JWT access tokens + opaque, rotated refresh-token sessions; RBAC via roles and permissions
  resolved from the database on every request (see [Authentication](#authentication) below)

Redis/queues, file storage, and Swagger/OpenAPI are architected in `PROJECT_SETUP.md` but not yet
implemented - they are introduced in their own Phase 0 steps, not repository initialization.

## Getting Started

```bash
# from repo root
pnpm install
cp apps/api/.env.example apps/api/.env

# start Postgres
pnpm docker:up

pnpm dev:api
```

## Project Structure

```
src/
├── main.ts                     # bootstrap
├── app.ts                       # app creation + middleware/pipe/CORS wiring (createApp, configureApp)
├── app.module.ts                # root module - global guards, ThrottlerModule
├── config/                      # environment validation + typed AppConfigService
├── common/
│   ├── audit/                    # append-only audit log writes
│   ├── errors/                    # AppError hierarchy (one class per stable API error code)
│   ├── filters/                    # global exception filter
│   ├── logging/                     # structured request logging
│   ├── pipes/                        # validation-error normalisation
│   └── request-context/               # per-request correlation ID
├── database/                    # Prisma client lifecycle (PrismaService)
├── infrastructure/               # provider abstractions: email, messaging, notifications, queue, storage, integrations
└── modules/
    ├── auth/                      # login/refresh/logout, sessions, JWT, RBAC guards, password reset
    ├── users/                      # user administration (list/create/status/role assignment)
    ├── roles/                       # read-only roles and permissions catalogue
    ├── leads/                       # CRM: lead lifecycle, assignment, conversion, activity timeline
    ├── lead-sources/                 # read-only lead source catalogue
    ├── follow-ups/                    # CRM: scheduling, completion, /me/follow-ups
    ├── contacts/                       # CRM: people, independent or company-linked
    ├── companies/                       # CRM: accounts/dealers/customers/suppliers
    ├── warehouses/                       # Inventory: warehouse master (no delete)
    ├── inventory/                          # Inventory: stock balances, adjustments, transfers, movement ledger
    ├── quotations/                          # Sales: quotation lifecycle, calculations, convert-to-order
    ├── sales-orders/                         # Sales: order lifecycle, stock check on confirm
    ├── suppliers/                             # Purchase: supplier profile (a thin extension of Company)
    ├── purchase-orders/                        # Purchase: PO lifecycle, calculations, approval-always workflow
    ├── goods-receipts/                          # Purchase: receiving, credits real Inventory stock
    └── health/                       # GET /api/v1/health, /health/ready
```

`common/commercial/` and `common/documents/` hold logic shared across Sales and Purchase (and future
Billing): line-item calculation (`quotation-line-calculator.ts`) and financial-year-aware document
numbering (`document-numbering.service.ts`), respectively. Purchase Orders use their own
`purchase-order-line-calculator.ts` rather than the shared one, since `unitPrice` must always be the
supplier's quoted price and is never defaulted from a product reference price, unlike Quotations.

Each feature module follows `controller -> service -> Prisma -> PostgreSQL`. Controllers stay thin;
business rules live in services.

## Authentication

JWT access tokens (15-minute default, stateless) plus an opaque, database-backed refresh token
delivered as an httpOnly cookie, rotated on every use. Presenting an already-rotated refresh token
is treated as theft and revokes every session for that user. Authorization is RBAC
(`User -> UserRole -> Role -> RolePermission -> Permission`), resolved from the database on every
request rather than cached in the token, so a role or status change takes effect immediately.

**First administrator.** There is no public registration. Set `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` in `apps/api/.env`, then run:

```bash
pnpm bootstrap:admin
```

This is a no-op once any administrator already exists, and a no-op entirely when either variable is
unset - safe to leave in a normal `.env` after the first run. Unset both again once you have an
administrator, so the credentials are not left sitting in the environment.

**Known limitation.** Password reset issues and stores a secure token, but no email/SMS provider is
configured yet (Phase 0 scope) - delivery is deferred. Outside production, the raw token is logged
so the flow can be completed locally: `pnpm dev:api` and watch for `DEV ONLY: password reset token`.

## CRM & Lead Management (Module 1)

Leads, lead sources, follow-ups, contacts and companies (CRM.md, API.md sections 38-48). Scope for
this pass follows CRM.md section 92's release order - Foundation, Daily Sales Execution, Pipeline
and Conversion. Explicitly deferred to later modules: Communication (WhatsApp/Email/SMS sending),
Visits/mobile workflows, Lead Scoring, record merge, and analytics.

Notable behaviour:

- **Duplicate detection** (CRM.md section 45): creating a lead or contact with a phone/email that
  matches an existing record is rejected (409 `DUPLICATE_RESOURCE`) unless the request sets
  `confirmDuplicate: true`. Companies get the same treatment on name/GSTIN/phone.
- **Lead conversion** (`POST /leads/{id}/convert`) creates or links a Company and Contact in one
  transaction, never duplicating an existing match, and preserves the lead's full activity history
  (CRM.md sections 47-48).
- **Lost leads** require a `lostReason`; reopening a lost lead clears the current loss fields, but
  the historical record survives in the lead's activity timeline, never erased (CRM.md section 51).
- **Follow-up overdue status is derived**, not stored (`scheduledAt` in the past + still `pending`),
  per DATABASE.md section 30.

## Product Catalog (Module 2)

Products, categories, brands and units (ARCHITECTURE.md section 19, DATABASE.md sections 38-45,
API.md sections 49-54) - no dedicated PRODUCT.md exists, so those three documents plus the schema
are authoritative. Shared across Sales/Inventory/Purchase/Billing once those modules exist; this
module owns the catalogue only.

Notable behaviour:

- **Categories and brands have no DELETE endpoint** (API.md sections 52-53) - deactivate via
  `PATCH { isActive: false }` instead, since products may still reference them.
- **Products archive on delete** (`archivedAt`, matching Leads/Contacts/Companies) - historical
  purchase/sales documents keep resolving an archived product once those modules exist.
- **SKU and category-scoped category names are checked for duplicates** explicitly in the service
  layer, since Postgres does not enforce uniqueness across `NULL` values in the `(parentId, name)`
  composite constraint.
- No dedicated permission codes exist for categories/brands/units - they reuse `product.*`, since
  ARCHITECTURE.md frames them as one module's responsibility, not separate permissioned resources.

## Inventory (Module 3)

Warehouses, stock balances, the stock movement ledger, and adjustment/transfer actions
(INVENTORY.md section 116, DATABASE.md sections 46-53, API.md sections 55-61). Scope for this pass
is the Foundation tier (Warehouses, Stock Balances, Stock Movement Ledger, Basic Stock Search) plus
Adjustments and Transfers - both self-contained and already backed by the schema's movement types
and seeded permissions. Explicitly deferred: Receiving (needs Purchase Orders), Sales
Allocation/Reservations and Fulfilment (need the Sales module), Stock Count/Reconciliation, Serial/
Batch/Barcode tracking, adjustment approval workflow, and Inventory Intelligence (ageing/dead-stock/
forecasting/analytics beyond a basic low-stock flag) - none of these exist yet, and most depend on
modules that are not built.

Notable behaviour:

- **Stock is a ledger, not just a balance**: `InventoryBalance` (current on-hand/reserved) is always
  updated in the same transaction as a `StockMovement` (the permanent record of *why* it changed).
  Movements are never created or edited directly by an endpoint - only as a side effect of an
  adjustment or transfer (DATABASE.md section 47, INVENTORY.md section 90).
- **`availableQuantity` and low-stock are derived, never stored** (`onHand - reserved`, flagged when
  at or below the product's `minimumStockLevel`) - DATABASE.md section 50.
- **Negative available stock is rejected by default** (`VALIDATION_ERROR`, INVENTORY.md section 86) -
  no override exists yet, since no permission or configuration for one has been approved. The check
  and the increment happen in the same guarded `UPDATE ... WHERE` statement (not a separate
  read-then-write), so two concurrent adjustments on the same balance can't race past the guard
  (DATABASE.md section 53, INVENTORY.md section 89).
- **Transfers are a paired movement**: one `transfer_out` and one `transfer_in`, sharing a generated
  `referenceId`, created in one transaction. The source debit uses the same guarded update as
  adjustments; the destination credit is a plain increment, which can never go negative.
- **Warehouses have no DELETE endpoint** (same reasoning as Categories/Brands) - deactivate via
  `PATCH { isActive: false }`, since balances/movements/goods receipts may still reference them.
- **Adjustment reason has no dedicated column** - the schema's `StockMovement.notes` is free text, so
  the reason is composed into it (`"damage: forklift crushed 3 units"`) rather than adding a new
  column for one enum this pass doesn't otherwise need.

## Sales (Module 4)

Quotations and Sales Orders (SALES.md section 106, DATABASE.md sections 55-59, API.md sections
62-68). Scope for this pass covers the Sales Foundation through Order Conversion tiers: Quotations
(creation, backend-authoritative calculations, the draft/approval/send/accept/reject workflow) and
Sales Orders (creation, confirmation with a non-blocking stock check, cancellation, completion).
"Opportunity" is not a separate entity - the schema has no Opportunity model, so it is simply a Lead
at `status: 'opportunity'` (already built in Module 1); Sales adds no new backend for it. Explicitly
deferred, since none are backed by the schema yet or depend on a module that doesn't exist: Price
Lists / customer-specific pricing, quotation versioning, Quotation PDF/WhatsApp/Email sending, a real
credit-check against outstanding balance (needs Billing), partial-availability/backorder/substitute
workflows (needs Inventory's Fulfilment tier), a repeat-order convenience action, and Sales
Targets/Forecast/Analytics.

Notable behaviour:

- **A discount always requires approval** (`quotation.approve`) before a quotation can be sent -
  `POST /quotations/{id}/submit` routes to `approval_pending` if `discountAmount > 0`, or straight to
  `approved` otherwise. No configurable per-role discount threshold exists yet (SALES.md sections
  34-35), so this is the simplest rule consistent with the documented intent.
- **Calculations are backend-authoritative** (SALES.md section 30): quantity x unit price -> line
  discount -> taxable value -> tax -> line total, then summed into subtotal/discount/tax/grand total,
  using `Prisma.Decimal` throughout - never floating point (CLAUDE.md section 55).
- **Line items snapshot the product** (SKU, name, description, HSN, unit, tax rate) at the moment
  they're added, so a later product-master change never retroactively alters an issued quotation or
  order (DATABASE.md section 57). `unitPrice` defaults to the product's `sellingPriceReference` when
  omitted - the only "applicable pricing" available until Price Lists exist.
- **Convert-to-order copies line items 1:1** (`POST /quotations/{id}/convert-to-order`), linking each
  `SalesOrderItem.quotationItemId` back to its source for traceability, and refuses a second
  conversion of the same quotation (409 `DUPLICATE_RESOURCE`).
- **Sales order confirmation never writes to stock**: it reads aggregate available quantity
  (`onHand - reserved` summed across all warehouses, since no warehouse is assigned to an order at
  this stage) and returns any shortage as a non-blocking warning, not a rejection - Inventory remains
  authoritative and reservations are Inventory's deferred Sales Allocation tier (SALES.md sections
  53, 55).
- **Document numbers are financial-year aware** (`QT/2026-27/000001`, `SO/2026-27/000001`), generated
  from the pre-existing `document_sequences` table via a single guarded `UPDATE ... RETURNING` -
  concurrency-safe, never `COUNT(*) + 1` (DATABASE.md sections 79-81).
- **Cancellation requires a reason** on both Quotations and Sales Orders, recorded in `notes` and
  audited via `AuditService` (no dedicated `quotation.cancel` permission is seeded, so it reuses
  `quotation.update`, matching the permission-reuse pattern from Modules 1-2).

## Purchase (Module 5)

Supplier profile, Purchase Orders and Goods Receipts (PURCHASE.md section 118, DATABASE.md sections
61-65, API.md sections 69-74). Scope for this pass covers Purchase Foundation through the Delivery
Tracking tier: a Supplier is simply a Company with `isSupplier: true` plus an optional
`SupplierProfile` extension (supplier code, payment terms, since date) - no new Contact/Company
backend, since Contacts already support company linkage regardless of customer/supplier. Purchase
Orders follow the same creation/calculation/workflow shape as Quotations, and Goods Receipts close
the loop on Inventory's deferred Receiving tier by crediting real stock. Explicitly deferred, since
none are backed by the schema yet: RFQ/Supplier Quotations/Quote Comparison, Purchase
Requisitions/Requirements/Procurement Planning, PO Amendment/Versioning, Purchase Returns, Supplier
Performance/Price Trends/Analytics, and PDF/WhatsApp/Email sending.

Notable behaviour:

- **Every PO requires approval**, unlike Quotations' discount-conditional gate -
  `POST /purchase-orders/{id}/submit` always moves `draft` to `approval_pending`. PURCHASE.md section
  38 frames a PO itself as "an approved commercial commitment," not a document that sometimes needs
  one.
- **`unitPrice` is always required, never defaulted** from a product reference price (unlike
  Quotations' `sellingPriceReference` fallback) - the supplier's actually quoted price is the only
  legitimate source, and no Supplier Product Mapping / RFQ exists yet to default from.
- **Goods Receipt creation is one transaction spanning two modules**: validate the PO and its
  remaining pending quantity, create the receipt and its items, credit `InventoryBalance` and write a
  `purchase_receipt` `StockMovement` via `InventoryService.receiveStock` (exported for this purpose),
  update each `PurchaseOrderItem.receivedQuantity`, and roll the PO up to `partially_received` or
  `received` - all inside `PrismaService.$transaction`, matching API.md section 74's sequence exactly.
- **Only the accepted quantity reaches stock**: `rejectedQuantity` still counts toward
  `receivedQuantity` (the supplier did deliver it, so it is no longer "pending"), but never credits
  `InventoryBalance` - quality rejection is a distinct commercial outcome from stock arrival
  (PURCHASE.md section 65's comment on `GoodsReceiptItem`).
- **Over-receipt is rejected outright** (`quantityReceived` cannot exceed `orderedQuantity -
  receivedQuantity`) rather than implementing PURCHASE.md section 59's configured tolerance/approval
  workflow, which has no approved design yet.
- **No dedicated `purchase_order.cancel` permission is seeded** (unlike `sales_order.cancel`) - PO
  cancellation reuses `purchase_order.update`, matching the permission-reuse pattern from Modules 1-2.

## Billing (Module 6)

Customer billing profile, Invoices and Payments (BILLING.md section 121, DATABASE.md sections 68-78,
API.md sections 76-83). Scope for this pass covers Billing Foundation through Payments: a customer's
`CustomerProfile` (customer code, credit limit / payment terms override, since date) mirrors Module
5's `SupplierProfile`; Invoices can be raised manually or from a confirmed Sales Order, with full
CGST/SGST/IGST calculation; Payments record with multi-invoice allocation, including advance/
unallocated payments. Explicitly deferred, since none are backed by the schema yet or depend on
infrastructure (Communication, File storage) that is still only `.gitkeep` placeholders: Credit
Notes/Debit Notes, Invoice PDF, Email/WhatsApp sending, Payment Receipts, payment reminders/Promise-
to-Pay, Credit Override approval workflows, Supplier Invoice tracking/matching, payment gateway/bank
reconciliation, and billing analytics/AI.

Notable behaviour:

- **Tax treatment is centralized, never guessed**: a single new seeded `application_settings` row
  (`billing.seller_state_code`) holds the selling entity's own GST state code; comparing it against
  the customer's `Company.stateCode` (a schema field that existed but was never exposed until this
  module - see Companies below) decides CGST+SGST (intra-state) vs IGST (inter-state). Both codes must
  be set, or invoice creation is rejected with a clear validation error (BILLING.md sections 18-19).
- **CGST/SGST are derived from the already-rounded flat tax amount**, not recomputed independently at
  half the rate twice - `cgstAmount = taxAmount / 2` (rounded) and `sgstAmount = taxAmount - cgstAmount`,
  so the two halves always sum back to exactly `taxAmount` with no paisa-level rounding mismatch.
- **Draft invoices do not count as outstanding.** `outstandingAmount` stays `0` until
  `POST /invoices/{id}/issue`, which is the moment a draft becomes a real receivable and
  `outstandingAmount` is set to the total - matching BILLING.md section 13.
- **A non-blocking credit-limit warning**, not a blocking check: invoice creation always succeeds;
  the response also reports the customer's outstanding-if-issued against their effective credit limit
  (`CustomerProfile` overrides `Company.creditLimit` when set) when it would be exceeded. No Credit
  Override/approval permission is modeled yet, mirroring Sales Order confirm's non-blocking stock
  check.
- **A confirmed Sales Order may only be invoiced once**: `POST /sales-orders/{id}/create-invoice`
  rejects a second call with `DUPLICATE_RESOURCE`, the same pattern as Quotation-to-Sales-Order
  conversion - the schema has no Dispatch/partial-fulfilment model yet to justify multiple invoices
  per order.
- **Payment allocation and reversal use the same guarded-update pattern as Inventory's stock
  writes**: a single `UPDATE ... WHERE outstanding_amount >= $amount RETURNING ...` (or the paid-
  amount equivalent for reversal) recomputes `paid_amount`/`outstanding_amount`/`status` atomically,
  so a concurrent allocation on the same invoice fails safely with `DUPLICATE_RESOURCE` rather than
  corrupting the balance.
- **A cancelled payment is reversed, not deleted**: `PaymentAllocation` rows are kept as history, the
  invoice's amounts they affected are restored, and the `Payment` itself is marked `cancelled` with
  the reason appended to its notes (BILLING.md section 39). No dedicated `payment.reverse` permission
  is seeded - reuses `payment.record`, matching the permission-reuse pattern from Modules 4-5.
- **Companies (Module 1) gained `stateCode`**: the schema field existed since Step 3 but was never
  exposed via the API/UI. Billing's GST determination is a genuine dependency on it, so
  `create`/`update` company DTOs, the mapper, and a new "Edit Company Details" modal (Module 1 never
  shipped one - only Create + Archive existed) were added to expose it, alongside credit limit and
  payment terms, which had the same gap.

## Reports & Analytics (Module 7)

A role-aware `GET /dashboard` plus one dedicated report per domain - Leads, Sales, Inventory,
Purchase, Billing, Outstanding, Team Performance (REPORTS.md section 148, technical/API.md sections
106-111). Every report is a pure read/aggregate query over tables that already exist - no new schema,
no new migration. Branch reports, Saved/Scheduled Reports, the async large-export job pattern, cross-
module attribution/profitability reports, AI summaries/forecasting/anomaly detection, and period-
over-period comparison are explicitly deferred - none are backed by the schema yet, depend on
infrastructure (a job queue) that doesn't exist, or are explicitly framed as future-platform
capability in REPORTS.md itself.

Notable behaviour:

- **The dashboard is permission-driven, not role-name-driven**: each section (followUps/leads/sales/
  purchase/inventory/billing) appears only if the caller's own permission set includes that domain's
  `*.read` code - never `if (role === 'Sales Manager')` (CLAUDE.md section 21). A Sales Executive
  naturally sees fewer cards than an Administrator without any special-casing on either the frontend
  or backend.
- **`followUps` closes a real gap**: PROJECT.md section 29 ("Which leads require follow-up?") and
  API.md section 109's own conceptual dashboard sketch both call for it, but it was missing from the
  first Dashboard pass - `FollowUp`'s `[assignedTo, status, scheduledAt]` index was already annotated
  "drives the 'my follow-ups due' queue" and simply had no query built against it yet. Always scoped
  to the caller's own pending follow-ups regardless of role (team-wide follow-up completion belongs to
  the existing Team Performance report, not this personal queue), split into `dueToday`/`overdue`
  counts plus a short (5-item) actionable list with a resolved `entityLabel` (the lead/contact/company
  name) and that record's id, so the frontend can link straight to it.
- **The frontend groups sections by urgency, not by domain**: "Needs your attention" (follow-ups,
  quotations awaiting approval, low stock, overdue invoices - danger-accented when something is
  overdue), "My work" (the actionable follow-up list), then "Business snapshot" (the original per-
  domain KPI cards, unchanged, demoted to a supporting role) - PROJECT.md section 29 frames the
  dashboard as "not primarily a reporting page," so raw counts alone were reorganized around what the
  caller should actually do next rather than replaced.
- **Team Performance (`GET /reports/team-performance`) was deferred here and completed in Module 9**:
  `Team`/`TeamMember` existed in the schema (Step 3) but were completely unused until Module 9 built a
  Teams module to create and assign them - reporting on it earlier would have reported against
  permanently-empty data.
- **CSV export is synchronous** (`GET /reports/{name}/export?format=csv`), matching API.md section
  111's "small report" path - every report here is a bounded aggregate query, so the async
  `POST /report-exports` job pattern (which would need queue infrastructure that doesn't exist) was
  never needed.
- **Ageing buckets are measured from the due date**, falling back to the invoice date when none is
  set (BILLING.md section 44) - an invoice with no configured due date is treated as already due,
  since there is no later date to wait for.
- **The Inventory list page now reads its `stockStatus` filter from the URL** (`?stockStatus=low`) -
  a small, targeted change so the dashboard's "Low Stock" card can link straight to a pre-filtered
  view instead of a bespoke drill-down screen.

## Communication (Module 8)

Communication Templates and Communications - the centralized log behind the Unified Communication
Timeline (PROJECT.md sections 20-27, technical/API.md sections 84-93, DATABASE.md sections 82-92).
Every table (`communications`, `communication_templates`, `communication_events`) already existed in
the schema from Phase 0 and was completely unused until this pass - no migration was needed. Delivery
webhooks, Calling, and Automation are explicitly deferred - see PROJECT.md sections 25-27.

Notable behaviour:

- **Real providers are wired per channel**: Twilio for WhatsApp and SMS (one account/SDK for both),
  SendGrid for Email - chosen as well-supported defaults (CLAUDE.md section 68: external provider
  choice) since this repository has no pre-existing vendor account. Business modules still only ever
  talk to `CommunicationProvider` (`COMMUNICATION_PROVIDER` injection token) - `communications.module.ts`
  binds it to `CompositeCommunicationProvider` (`infrastructure/messaging/providers/`), which routes
  `send()` to `TwilioWhatsAppProvider`, `TwilioSmsProvider` or `SendGridEmailProvider` by channel.
  Swapping any single channel's vendor, or the whole composition, touches only that binding - never
  `CommunicationsService` (CLAUDE.md sections 25-27).
- **Each channel degrades independently and honestly** when its own required env vars
  (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_WHATSAPP_FROM`/`TWILIO_SMS_FROM`,
  `SENDGRID_API_KEY`/`SENDGRID_FROM_EMAIL` - all optional, see `.env.example`) are absent: `POST
  /communications` ends up `failed` with a clear per-channel reason ("Twilio WhatsApp is not configured
  for this environment (set ...)"), rather than faking `sent`/`delivered` or leaving the record `queued`
  forever with nothing that will ever progress it (CLAUDE.md section 31: never treat a request as proof
  delivery succeeded). No real vendor account exists in this repository, so nothing sends until an
  operator supplies real credentials as environment variables - Claude/Claude Code never creates vendor
  accounts or handles real secrets on the user's behalf.
- **Provider-level behaviour (successful sends, partial configuration, vendor-rejected sends) is unit-
  tested** against a mocked vendor SDK in `src/infrastructure/messaging/providers/*.spec.ts` (`pnpm
  test`), independent of the database/HTTP layer. The e2e-live suite (`test/communication.e2e-live-
  spec.ts`) exercises the honest "not configured" failure path per channel, since this repository's test
  environment has no real credentials either.
- **Either an approved template or an ad-hoc message, never neither**: `POST /communications` accepts
  `templateId` + `variables` (substituted into `{{placeholder}}` tokens, with a clear validation error
  listing any variable the caller forgot to supply) or a direct `subject`/`messageBody` - the service
  rejects a request with neither. A template's `channel` must match the request's `channel`.
  `communication_template.manage` gates create/update; there is no `communication_template.read`
  seeded, so viewing templates reuses `communication.read`.
- **`relatedEntityType`/`relatedEntityId` integrity is enforced in the application layer**, not by a
  database foreign key, since a communication can polymorphically attach to any of ten different
  entity types (DATABASE.md section 87) - the service checks the referenced row actually exists
  before creating the record, and rejects `relatedEntityId` supplied without `relatedEntityType` (or
  vice versa).
- **No dedicated per-entity convenience routes** (`GET /leads/{id}/communications`, etc.) beyond what
  the generic `GET /communications?relatedEntityType=X&relatedEntityId=Y` already covers - API.md's
  own wording ("may include") frames those as optional sugar, not a requirement, and the generic
  filtered endpoint already serves the same data.

## Team Management (Module 9)

Teams & Reporting Structure only, per explicit scope direction (PROJECT.md section 18,
technical/API.md section 102): Team CRUD, membership, manager assignment, team-scoped visibility on
Leads/Quotations/Sales Orders, and the Team Performance report. `Team`/`TeamMember` existed in the
schema since Phase 0 and were completely unused - no migration was needed. Territories, Tasks, Daily
Activities, Attendance, GPS Check-ins, Meeting Reports, Targets, Expense Claims, Leave and Travel Logs
are explicitly deferred - none have schema or an approved design, and several raise business-policy
questions (Attendance, Leave, Expense Claims, GPS tracking) that have not been answered yet.

Notable behaviour:

- **A single `team.manage` permission gates every `/teams` route, reads included** - there is no
  separate `team.read`, mirroring the existing `role.manage` precedent (`RolesController` gates its
  own `GET` routes the same way).
- **Removing a member is a soft removal**: `TeamMember.isActive` is set to `false` rather than deleting
  the row, preserving `joinedAt` history; re-adding the same user reactivates the row (and refreshes
  `joinedAt`) instead of violating the `(teamId, userId)` unique constraint with a second insert.
- **Lead already carried `assignedTeamId`** (accepted since Module 1 but never validated or surfaced in
  any UI) - Module 9 closes that gap: `?teamId=` filters `GET /leads` directly against the column, and
  both `POST /leads` and `POST /leads/{id}/assign` now validate the team actually exists.
- **Quotations and Sales Orders have no team column**, only an `ownerId` - their `?teamId=` filter
  resolves the team's active member user IDs first (`common/teams/team-scope.ts`), then filters
  `ownerId IN (...)`. An unknown or empty team simply yields no matches, same as any other filter that
  narrows to nothing.
- **Team Performance (`GET /reports/team-performance`) closes the Module 7 deferral** - per-team lead/
  quotation/sales-order aggregates over the same resolved member set, gated by `report.view` like every
  other report.

## File Attachments

A platform capability, not its own module page (ARCHITECTURE.md sections 62-67, technical/API.md
sections 96-99, technical/DATABASE.md sections 93-95): upload, entity-scoped list, download and
delete for files attached to any of the ten `RelatedEntityType`s Communication already attaches to
(Lead, Contact, Company, Quotation, Sales Order, Purchase Order, Goods Receipt, Invoice, Payment,
Product). `File`/`FileLink` existed in the schema since Phase 0 and were completely unused - no
migration was needed. The signed-upload flow (API.md section 98, for very large files), PDF
generation (sections 65, 78), malware scanning, and file versioning on regeneration (DATABASE.md
section 96) are explicitly deferred.

Notable behaviour:

- **`StorageProvider` is a swappable abstraction, same shape as `CommunicationProvider`**
  (`infrastructure/storage/storage-provider.interface.ts`, injected as `STORAGE_PROVIDER`) - business
  code never touches a specific object-storage SDK. Unlike Communication's honest-failure stub,
  local development gets a fully working implementation
  (`LocalFilesystemStorageProvider`, writing under `STORAGE_LOCAL_PATH` or `apps/api/uploads` by
  default) rather than a "not configured" placeholder, per PROJECT_SETUP.md section 23 ("Local
  development may use local storage"). A cloud provider (Google Cloud Storage) is a later binding
  swap in `files.module.ts`.
- **One `File` links to exactly one entity in this pass** - upload always creates both rows together,
  so `FileLink`, not the bare `File`, is the natural root for "what's attached to this record."
- **Entity-existence validation is shared with Communication**, not reimplemented: promoted from
  `communications.service.ts` into `common/entities/entity-existence.ts` once Files needed the
  identical polymorphic check a second time.
- **Storage keys are generated (`{entityType}/{uuid}{ext}`), never derived from the uploaded
  filename** (PROJECT_SETUP.md: "Generate controlled storage names instead of blindly using uploaded
  filenames") - the original filename is preserved separately as display-only metadata.
- **Deletion is a soft delete of the metadata row** (`File.deletedAt`, matching DATABASE.md section
  93) **but reclaims the storage bytes immediately** - there is no restore feature in this pass, so
  keeping orphaned bytes around indefinitely would be pure waste.
- **Upload validates size (20MB) and MIME type against an allowlist** before touching storage, so a
  rejected upload always produces a clean `VALIDATION_ERROR`, not a raw multer error.
- **`file.upload` / `file.read` / `file.delete`** are domain-level permissions, orthogonal to the
  specific entity a file attaches to - the same simpler design Communication already established
  with `communication.read` / `communication.send`, rather than delegating to each target entity's
  own permission set.

## In-App Notifications

A platform capability (PROJECT.md section 26, ARCHITECTURE.md sections 76-80, API.md sections
100-101): a personal notification inbox - list, unread count, mark-read, mark-all-read - driven by
internal domain events, not called directly by the business modules that trigger them.
`Notification` existed in the schema since Phase 0 and was completely unused - no migration was
needed. Scope for this pass: five trigger events that are pure, synchronous reactions to a user
action - **Lead Assigned**, **Quotation Approval Required** (only when a discount actually pushes it
into `approval_pending`), **Purchase Order Approval Required**, **Payment Received** (to the
customer company's account owner), and **Low Stock** (checked after adjustments/transfers, using
the existing `minimumStockLevel` field). **Follow-up Due** and **Invoice Overdue** are explicitly
deferred - both are genuinely time-based rather than action-triggered, so they need a real scheduled
job, which is new infrastructure and its own decision. **Task Assigned** and **Support Escalation**
are deferred - neither Tasks nor Customer Service have schema yet. External notification channels
(Email, WhatsApp, SMS, Web/Mobile Push) are explicitly deferred - PROJECT.md frames them as "potential
channels," and this is a distinct decision from Communication's own real providers (Module 8): pushing
an in-app notification out over Email/WhatsApp/SMS would need its own trigger/template/preference
design, not just a wired channel.

Notable behaviour:

- **`Domain Event -> Notification Service -> In-App Notification`** (ARCHITECTURE.md section 77),
  implemented with Nest's own in-process `EventEmitter2` (`@nestjs/event-emitter`) - internal
  application events, not external event infrastructure (CLAUDE.md section 29). Event names and
  payload shapes live in `common/events/domain-events.ts`; `NotificationTriggersListener`
  (`modules/notifications/notification-triggers.listener.ts`) is the only thing that reacts to them
  today, but any future listener (audit, communication, background work) can subscribe to the same
  events without the emitting module ever knowing.
- **A listener failure never fails the business action that triggered it, and never outlives the
  request either.** `common/events/emit-domain-event.ts`'s `emitDomainEvent()` awaits
  `emitAsync()` (so no notification write is still in flight after the request/response - or a test's
  `app.close()` - completes) but swallows and logs any listener error, rather than letting a
  notification-write failure surface as a failure of the lead assignment, quotation submission, etc.
  that triggered it (CLAUDE.md section 31's spirit applied to internal events, not just external
  providers).
- **Events are emitted only after their transaction commits, never from inside one.** Inventory's
  low-stock check originally lived inside the adjustment/transfer `$transaction` callback; it was
  moved to run after the transaction resolves, since a listener side effect (a notification write, on
  a separate connection) must never be observable before the change it describes is actually durable.
- **Low Stock fires only on the false -> true crossing**, never on every movement that merely keeps a
  balance low (PROJECT.md section 26: "Users should not be overwhelmed with unnecessary
  notifications") - `InventoryService` fetches the balance immediately before a stock-decreasing
  adjustment or transfer, alongside the one immediately after, and only emits when the "before" state
  was not low and the "after" state is.
- **`GET/POST /notifications*` has no `@RequirePermission`** - every authenticated user manages only
  their own notifications (`WHERE userId = actor.id`, enforced in `NotificationsService`, never a
  client-supplied filter), the same precedent as `/dashboard`. Requiring a permission to see
  notifications generated *for* you would be backwards - nobody would have it by default under the
  current RBAC seed (only Administrator holds any permission at all).
- **Approval-required notifications fan out to every current holder of the approving permission**
  (`quotation.approve` / `purchase_order.approve` / `inventory.adjust` for Low Stock), found via
  `common/users/permission-holders.ts`'s `findUserIdsWithPermission()` - a role/permission join, not
  a hardcoded role-name check (CLAUDE.md section 21).

## Addresses

A platform capability (technical/DATABASE.md sections 36-37): CRUD for addresses attached to a
Company, Contact, or Warehouse - a billing/shipping address on a customer or supplier, or a
warehouse's physical location. `Address` existed in the schema since Phase 0 and was completely
unused - no migration was needed.

Notable behaviour:

- **An address belongs to exactly one owner**, via dedicated nullable `companyId`/`contactId`/
  `warehouseId` foreign keys plus a database CHECK constraint (`addresses_single_owner`) - not a
  generic `relatedEntityType`/`relatedEntityId` pair like Files/Communications use. DATABASE.md
  section 36 explicitly prefers relational integrity over that convenience here, since an address
  only ever attaches to one of three fixed entity types. `AddressesService` mirrors the same
  "exactly one" rule at the application layer with a friendly `VALIDATION_ERROR`, rather than
  surfacing the constraint violation directly.
- **One default address per owner and addressType**: creating or updating an address with
  `isDefault: true` clears the previous default for that same owner + addressType combination (e.g.
  setting a new default *billing* address doesn't touch the existing default *shipping* address).
- **Blank optional fields are normalized, not stored literally**: a cleared text input submits `""`,
  not an absent key - `AddressesService` treats a blank `line2`/`stateCode`/`postalCode` as "not set"
  (create: omitted, so the column stays its natural `null`; update: explicitly nulled). `countryCode`
  is the one exception - the column is `NOT NULL` with a database default of `"IN"`, so a blank
  `countryCode` resets to `"IN"` instead of being nulled. This was an actual bug caught during manual
  browser QA (a real form submission sends `""`, unlike a test payload that simply omits the key) and
  is covered by regression tests in `test/addresses.e2e-live-spec.ts`.
- **`address.read` / `address.manage`** are domain-level permissions, orthogonal to the owning
  entity's own permissions - the same precedent Files established with `file.upload`/`file.read`/
  `file.delete`.
- **Wiring the `billingAddressSnapshot`/`shippingAddressSnapshot`/`supplierAddressSnapshot` JSON
  columns already present on Quotation/SalesOrder/PurchaseOrder/Invoice** (so those documents capture
  an immutable copy of the address at creation time) is a deliberate follow-up, not done in this
  pass - it touches four already-shipped financial services and deserves its own reviewed pass
  (CLAUDE.md section 75), rather than being bundled into a focused platform-capability change.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start in watch mode |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check, no emit |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | End-to-end tests (no database required) |
| `pnpm test:e2e:db` | End-to-end auth/RBAC tests against a real database (see below) |
| `pnpm test:db` | Schema and seed integration tests against a real database |
| `pnpm prisma:migrate:dev` | Run Prisma migrations locally |
| `pnpm bootstrap:admin` | Provision the first administrator from `BOOTSTRAP_ADMIN_EMAIL`/`_PASSWORD` |

`test:e2e:db` boots the real application (guards, middleware and all) against `TEST_DATABASE_URL`
and exercises login, session rotation/reuse-detection, RBAC, user-status enforcement, password
reset/change, audit logging, login rate-limiting, the CRM lead/follow-up/contact/company workflows,
the product/category/brand/unit catalogue, warehouses/stock balances/adjustments/transfers, the
quotation/sales-order workflow (calculations, approval gate, conversion, stock-check confirmation),
the purchase-order/goods-receipt workflow (calculations, always-approval, partial/full receiving,
inventory crediting, over-receipt rejection), and the customer-profile/invoice/payment workflow
(GST split for both intra- and inter-state, credit-limit warning, payment allocation/reversal,
outstanding-invoices lookup), the dashboard/reports workflow (permission-gated dashboard
sections, funnel/source/conversion, sales overview and top products/customers, stock summary and
low-stock, purchase overview and supplier spend, invoice register and collections, outstanding
ageing buckets, CSV export), the communication workflow (template CRUD and duplicate-name
rejection, send-from-template variable substitution, ad-hoc sends, the honest no-provider-configured
failure path, related-entity existence validation, filtered history), the team management
workflow (team CRUD, membership add/remove/reactivate, manager and member existence validation, the
`team.manage` permission gate, the `?teamId=` filter on leads/quotations/sales-orders, and the team
performance report), the file attachments workflow (upload against real local-disk storage,
size/MIME validation, entity-existence validation, entity-scoped listing excluding soft-deleted
files, download returning the original bytes/filename/content-type, and permission gating), and the
notifications workflow (each of the five trigger events firing for the right recipient(s) via a real
action - lead assignment, quotation/purchase-order submission, payment recording, a stock adjustment
crossing the low-stock threshold - plus the "no notification when nothing should fire" cases,
per-user scoping, unread count, mark-read, and mark-all-read) - all with real HTTP requests, not
mocked Prisma, and real bytes on disk (redirected to a dedicated `uploads-test` directory - see
`test/database/point-app-at-test-db.ts`). Every test gets its own application instance so the login
endpoint's rate limit cannot leak between tests. Like `test:db`, it refuses to run unless
`TEST_DATABASE_URL` names a database ending in `_test`.

## Status

Authentication/RBAC foundation, Module 1 (CRM & Lead Management), Module 2 (Product Catalog),
Module 3 (Inventory - Foundation tier plus Adjustments/Transfers), Module 4 (Sales - Quotations and
Sales Orders through Order Conversion), Module 5 (Purchase - Supplier profile, Purchase Orders,
Goods Receipts), Module 6 (Billing - Customer profile, Invoices, Payments), Module 7 (Reports &
Analytics - Dashboard, Leads/Sales/Inventory/Purchase/Billing/Outstanding/Team Performance reports),
Module 8 (Communication - Templates, Communications log, Unified Communication Timeline slices on
Lead/Company/Invoice), Module 9 (Team Management - Teams & Reporting Structure: CRUD, membership,
manager assignment, team-scoped visibility on Leads/Quotations/Sales Orders), File Attachments (a
platform capability: upload/list/download/delete, attachable to any of ten entity types) and In-App
Notifications (a platform capability: five domain-event-driven triggers, personal-scope
list/unread-count/mark-read) complete, backend and frontend. See `PROJECT_SETUP.md` section 67 for
the Phase 0 implementation order and this repo's own module roadmap for the planned build order
after Phase 0.
