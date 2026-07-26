# Local Development Setup

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable` will provide it)
- Docker + Docker Compose (for Postgres)

## Install

```bash
git clone <repo-url>
cd CRM
nvm use          # or ensure Node 22 is active
corepack enable
pnpm install
```

## Environment Files

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

## Start Postgres

```bash
pnpm docker:up
```

## Run Apps

```bash
pnpm dev:api    # http://localhost:4000/api/v1/health
pnpm dev:web    # http://localhost:3000
```

## Common Scripts

| Command | Description |
| --- | --- |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm test` | Run tests in all workspaces |
| `pnpm build` | Build api + web |
| `pnpm format` | Format the repo with Prettier |

## Status

This repository currently contains foundation/scaffolding only (no database models, APIs, or UI
screens). See [`PROJECT_SETUP.md`](../PROJECT_SETUP.md) section 67 for the Phase 0 implementation
order that follows this foundation.

## Note on `docs/sds/` and `docs/README.md`

`docs/sds/` is an earlier Software Design Specification, superseded by the top-level `PROJECT.md`,
`PROJECT_SETUP.md`, `CLAUDE.md`, `docs/*.md` module specs, `design-system/`, `technical/`, and
`prompts/` documents. `docs/README.md` (the `docs/sds/` volume index) has not been reconciled with
this newer documentation set - see the repository initialization report for details.
