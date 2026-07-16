# CRM Platform

A modular, multi-tenant CRM covering lead management, site visits, customer
and order management, and billing — for web (Next.js) and mobile
(React Native / Expo), sharing one NestJS + Prisma + PostgreSQL backend.

This repository is currently a **foundation only**: workspace, tooling, and
folder structure. No database models, APIs, or UI screens have been
implemented yet. See [`docs/setup.md`](docs/setup.md) to get running, and
[`docs/README.md`](docs/README.md) for the full specification index and a
list of documentation gaps/conflicts found during setup.

## Structure

```
backend/          NestJS API (TypeScript, Prisma, PostgreSQL, Redis, BullMQ)
frontend/         Next.js App Router web app (TypeScript, Tailwind, shadcn/ui)
mobile/           React Native / Expo app for field sales executives
database/         Database-level artifacts outside Prisma's lifecycle
infrastructure/   Docker Compose + Dockerfiles for local/dev environments
docs/             Software Design Specification (source of truth) + setup guide
.github/          CI workflows, PR template
```

## Tech Stack

| Layer | Stack |
| --- | --- |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis, BullMQ |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Mobile | React Native, Expo, Expo Router |
| Infra | Docker, Docker Compose |
| Monorepo | pnpm workspaces |

## Getting Started

See [`docs/setup.md`](docs/setup.md).

## Documentation

The Software Design Specification lives in [`docs/sds/`](docs/sds), organized
into the volume structure defined by the project's Master Plan. Start at
[`docs/README.md`](docs/README.md) for the index, precedence order, and known
documentation gaps.
