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
and the purchase-order/goods-receipt workflow (calculations, always-approval, partial/full receiving,
inventory crediting, over-receipt rejection) - all with real HTTP requests, not mocked Prisma.
Every test gets its own application instance so the login endpoint's rate limit cannot leak between
tests. Like `test:db`, it refuses to run unless `TEST_DATABASE_URL` names a database ending in
`_test`.

## Status

Authentication/RBAC foundation, Module 1 (CRM & Lead Management), Module 2 (Product Catalog),
Module 3 (Inventory - Foundation tier plus Adjustments/Transfers), Module 4 (Sales - Quotations and
Sales Orders through Order Conversion) and Module 5 (Purchase - Supplier profile, Purchase Orders,
Goods Receipts) complete, backend and frontend. No other business modules (Billing, Communication,
Reports, ...) exist yet - see `PROJECT_SETUP.md` section 67 for the Phase 0 implementation order and
this repo's own module roadmap for the planned build order after Phase 0.
