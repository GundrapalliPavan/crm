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
    └── health/                       # GET /api/v1/health, /health/ready
```

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
reset/change, audit logging and login rate-limiting with real HTTP requests - not mocked Prisma.
Every test gets its own application instance so the login endpoint's rate limit cannot leak between
tests. Like `test:db`, it refuses to run unless `TEST_DATABASE_URL` names a database ending in
`_test`.

## Status

Step 4 complete: authentication, users and RBAC foundation. No business modules (Leads, Contacts,
Companies, Sales, ...) exist yet - see `PROJECT_SETUP.md` section 67 for the Phase 0 implementation
order.
