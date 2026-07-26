# Database

PostgreSQL is the system of record. Prisma owns the schema definition and migration history:

- Schema: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma)
- Migrations: `apps/api/prisma/migrations/`
- Reference seed: [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts)

This folder holds database-level artifacts that live outside the ORM's lifecycle.

See [`DATABASE.md`](../technical/DATABASE.md) for the full design specification.

**Deviation from `PROJECT_SETUP.md` section 8:** the spec's conceptual tree shows `database/prisma/`.
The schema sits at `apps/api/prisma/schema.prisma` instead (Prisma's default convention for a single
consuming package) because `prisma generate` internally runs `pnpm add <exact-version> -D` from the
schema file's directory, which pnpm blocks at the workspace root without `-w` since `database/` is
not a workspace package. See the Step 1 completion report for the reproduction.

## Structure

```
migrations/   # Reserved for manual/out-of-band SQL that must run outside Prisma's
              # migrate flow. Prisma's own migrations live in apps/api/prisma/migrations/.
seed/         # Reserved for optional development fixtures. Foundational reference
              # data is seeded by apps/api/prisma/seed.ts.
scripts/      # Operational scripts (backup, restore, data export) added as needed.
```

## Domains

| Domain | Tables |
| --- | --- |
| Identity | `users`, `teams`, `team_members`, `roles`, `permissions`, `user_roles`, `role_permissions` |
| CRM | `leads`, `lead_sources`, `lead_activities`, `follow_ups`, `contacts`, `companies`, `customer_profiles`, `supplier_profiles`, `addresses` |
| Catalog | `products`, `product_categories`, `brands`, `units` |
| Inventory | `warehouses`, `inventory_balances`, `stock_movements` |
| Sales | `quotations`, `quotation_items`, `sales_orders`, `sales_order_items` |
| Purchase | `purchase_orders`, `purchase_order_items`, `goods_receipts`, `goods_receipt_items` |
| Billing | `invoices`, `invoice_items`, `payments`, `payment_allocations` |
| Communication | `communications`, `communication_templates`, `communication_events` |
| Platform | `files`, `file_links`, `notifications`, `audit_logs`, `document_sequences`, `application_settings` |

## Conventions

- **UUID primary keys** on every table. Business document numbers
  (`invoice_number`, `po_number`) are separate columns, never keys.
- **Single organization.** There is no `organizations` table and no
  `organization_id` column, per `DATABASE.md` sections 157-158. This deviates
  from `PROJECT_SETUP.md` section 14; the contradiction was raised and the
  `DATABASE.md` model chosen. UUID keys keep a future migration open.
- **Timestamps** are `TIMESTAMPTZ` stored in UTC; business dates that have no
  time-of-day meaning (`invoice_date`, `due_date`) are `DATE`.
- **Numeric precision**, applied consistently by category:
  | Category | Type | Used for |
  | --- | --- | --- |
  | Amounts | `NUMERIC(18,2)` | totals, tax, discount, payments, allocations |
  | Unit rates | `NUMERIC(18,4)` | unit prices and costs |
  | Quantities | `NUMERIC(18,3)` | stock and line quantities |
  | Percentages | `NUMERIC(5,2)` | tax and discount rates |
- **Money is never floating point.** Line items snapshot their price, tax and
  description so issued documents never change with master data.
- **Inventory** is a signed ledger (`stock_movements.quantity_delta`) plus a
  derived balance (`inventory_balances`). There is one source of truth.
- **Delete behaviour** is deliberate: `CASCADE` only for owned children (line
  items, join rows); `RESTRICT` for anything financial, inventory or historical;
  `SET NULL` for attribution links so evidence survives a user being removed.
- **Soft deletion** (`archived_at`) exists only on master records that need it -
  users, contacts, companies, leads, products - not on every table.
