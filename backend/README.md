# CRM Platform - Backend

NestJS + TypeScript + Prisma + PostgreSQL + Redis API for the CRM Platform.

See [`docs/sds/volume-7-engineering/07_Backend_Architecture.md`](../docs/sds/volume-7-engineering/07_Backend_Architecture.md) for the full architecture specification.

## Stack

- NestJS 11 (TypeScript, strict mode)
- Prisma ORM (PostgreSQL)
- Redis (cache) + BullMQ (queues)
- JWT authentication (access + refresh tokens)
- Swagger/OpenAPI at `/api/docs`

## Getting Started

```bash
# from repo root
pnpm install
cp backend/.env.example backend/.env

# start Postgres + Redis
pnpm docker:up

pnpm dev:backend
```

## Project Structure

```
src/
├── main.ts              # bootstrap
├── app.module.ts         # root module
├── config/               # environment configuration
├── common/               # shared decorators, dto, guards, filters, pipes, utils
├── modules/              # feature modules (auth, users, leads, visits, ...)
└── prisma/               # schema.prisma + Prisma service
```

Each feature module follows the pattern `controller -> service -> repository -> Prisma -> PostgreSQL`.
Controllers stay thin; business rules live in services; repositories are the only layer that talks to Prisma.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start in watch mode |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check, no emit |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | End-to-end tests |
| `pnpm prisma:migrate:dev` | Run Prisma migrations locally |

## Status

Repository foundation only. No modules, models, or endpoints have been implemented yet -
see `docs/sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md` for the implementation order.
