# CRM Platform

A modular CRM for a single-organization electrical products distributor, covering leads, site visits,
customers, orders, inventory, purchasing, and billing - built on one NestJS + Prisma + PostgreSQL
API, initially served by a responsive React web application.

The foundation (workspace, tooling, database schema, authentication/RBAC) is complete. CRM & Lead
Management (Module 1: leads, contacts, companies, follow-ups), the Product Catalog (Module 2:
products, categories, brands, units), Inventory (Module 3: warehouses, stock balances, movement
ledger, adjustments, transfers), Sales (Module 4: opportunities, quotations, sales orders) and
Purchase (Module 5: supplier profile, purchase orders, goods receipts) are implemented. Billing,
Communication and Reports do not exist yet. See [`PROJECT_SETUP.md`](PROJECT_SETUP.md) for the
technical foundation specification and [`PROJECT.md`](PROJECT.md) for the product specification.

## Structure

```
apps/
├── api/            NestJS API (TypeScript, Prisma, PostgreSQL)
└── web/            Vite + React web app (TypeScript, Tailwind CSS)
packages/
├── ui/             Shared React web UI components
├── types/          Shared API contracts (error codes, response envelopes)
├── validation/     Shared Zod validation schemas
├── config/         Shared configuration constants
└── utils/          Shared, client-independent utilities
database/           Migrations and seed scripts (Prisma schema: apps/api/prisma)
infrastructure/     Docker Compose for local Postgres
docs/               Module specifications (CRM, Sales, Inventory, Purchase, Billing, Reports)
design-system/      Colors, typography, component specifications
technical/          Architecture, database, and API specifications
prompts/            Backend, frontend, and UX specifications
.github/            CI workflows, PR template
```

## Tech Stack

| Layer | Stack |
| --- | --- |
| API | NestJS, TypeScript, Prisma, PostgreSQL |
| Web | Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod |
| Infra | Docker, Docker Compose |
| Monorepo | pnpm workspaces |

A native mobile app (React Native / Expo) is planned for a later phase and is not part of this
foundation - see `PROJECT_SETUP.md`'s Future Mobile Application Readiness section.

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable` provides it)
- Docker + Docker Compose (for Postgres)

### Install

```bash
git clone <repo-url>
cd CRM
nvm use            # or ensure Node 22 is active
corepack enable
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Start PostgreSQL

With Docker:

```bash
pnpm docker:up
```

Or with a locally installed PostgreSQL 16, create the two databases the project
expects (`crm_dev` for development, `crm_test` for the database test suite):

```bash
createuser --createdb crm_user && createdb -O crm_user crm_dev && createdb -O crm_user crm_test
```

### Set Up the Database

```bash
pnpm db:migrate   # apply migrations to crm_dev
pnpm db:seed      # load reference data (safe to re-run)
```

`pnpm db:seed` loads permissions, system roles, units and lead sources only. It
is idempotent, and never seeds business data.

To rebuild the development database from scratch:

```bash
pnpm db:reset     # drops, re-migrates and re-seeds - development only
```

### Run Apps

```bash
pnpm dev        # api + web together
```

Or individually:

```bash
pnpm dev:api    # http://localhost:4000/api/v1
pnpm dev:web    # http://localhost:3000
```

The API validates its environment at startup and exits with a clear message if a
required variable is missing or malformed.

### Sign In (Development)

There is no public registration. Create the first administrator, then sign in at
`http://localhost:3000/login`:

```bash
# apps/api/.env
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=<a password meeting the policy - see below>
```

```bash
pnpm bootstrap:admin
```

Safe to leave configured or re-run - it is a no-op once any administrator already exists, and a
no-op entirely when either variable is unset. Unset both again afterwards so the credentials are not
left sitting in the environment. See [`apps/api/README.md`](apps/api/README.md#authentication) for
the full authentication architecture and its one documented limitation (password reset delivery).

### Common Scripts

| Command | Description |
| --- | --- |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm test` | Run all tests (unit, API integration, database, auth e2e) |
| `pnpm build` | Build shared packages, then api + web |
| `pnpm format` | Format the repo with Prettier |
| `pnpm db:migrate` | Create and apply a migration |
| `pnpm db:seed` | Load reference data |
| `pnpm db:reset` | Rebuild the development database from migrations |
| `pnpm bootstrap:admin` | Provision the first administrator (see above) |

### Database

The Prisma schema lives at [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma)
and migrations at `apps/api/prisma/migrations/`. See
[`database/README.md`](database/README.md) for the model overview and conventions.

Database integration tests run against `TEST_DATABASE_URL` and truncate tables
between tests, so that variable must name a database ending in `_test`; the
suite refuses to start otherwise.

```bash
pnpm --filter @crm/api test:db       # schema + seed integration tests
pnpm --filter @crm/api test:e2e:db   # authentication, sessions, RBAC (real HTTP + real database)
```

### Environment Variables

| Variable | App | Purpose |
| --- | --- | --- |
| `NODE_ENV` | api | `development` \| `test` \| `production` |
| `PORT` | api | Port the API listens on |
| `API_PREFIX` | api | Base path, including version (`api/v1`) |
| `WEB_ORIGIN` | api | Browser origin allowed by CORS |
| `DATABASE_URL` | api | PostgreSQL connection string |
| `TEST_DATABASE_URL` | api | Dedicated database for destructive test suites; must end in `_test` |
| `AUTH_JWT_SECRET` | api | Signs access-token JWTs (32+ chars; generate a real value, never reuse the example) |
| `AUTH_ACCESS_TOKEN_TTL_MINUTES` | api | Access token lifetime |
| `AUTH_REFRESH_TOKEN_TTL_DAYS` | api | Refresh session lifetime |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | api | Optional first-administrator bootstrap - see [Sign In](#sign-in-development) |
| `VITE_API_BASE_URL` | web | API base URL used by the HTTP client |
| `POSTGRES_*` | docker | Local Postgres container settings |

Only `VITE_`-prefixed variables reach the browser bundle. Never put a secret behind
that prefix.

### System Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/health` | Liveness - process is up. Touches no dependencies. |
| `GET /api/v1/health/ready` | Readiness - returns 503 while PostgreSQL is unreachable. |

Every response carries an `X-Request-ID`; a well-formed inbound one is honoured so a
trace can span client and server. Errors use a single envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {}, "requestId": "req_..." } }
```

## Documentation

Start at [`CLAUDE.md`](CLAUDE.md) for how this repository is meant to be worked on, then
[`PROJECT.md`](PROJECT.md) and [`PROJECT_SETUP.md`](PROJECT_SETUP.md) for the product and technical
specifications. Module-level specs live in [`docs/`](docs), design tokens in
[`design-system/`](design-system), and detailed architecture in [`technical/`](technical) and
[`prompts/`](prompts).
