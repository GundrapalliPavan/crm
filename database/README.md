# Database

PostgreSQL is the system of record. Prisma (in [`backend/src/prisma`](../backend/src/prisma))
owns the schema definition and migration history for the application; this folder holds
database-level artifacts that live outside the ORM's lifecycle.

See [`docs/sds/volume-4-data`](../docs/sds/volume-4-data) for the Database Design, ER Diagram,
PostgreSQL Schema, and Prisma Schema specification documents.

## Structure

```
migrations/   # Prisma-generated SQL migrations are checked in here via
              # backend/src/prisma/migrations - this folder is reserved for any
              # manual/out-of-band SQL that must run outside Prisma's migrate flow.
seeds/        # Seed scripts for master data (lead_status, lead_sources, order_status,
              # payment_methods, roles, permissions) once modules are implemented.
scripts/      # Operational scripts (backup, restore, data export) added as needed.
```

## Standards

- UUID primary keys on every table.
- `organization_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`
  on every transactional table (multi-tenant, soft-delete, audit-ready).
- snake_case table/column names, `_id` suffix on foreign keys.

No tables, migrations, or seed data exist yet - this is repository foundation only.
Implementation follows the order defined in
[`docs/sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md`](../docs/sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md):
ER Diagram → PostgreSQL Schema → Prisma Models → Migrations → Seed Data.
