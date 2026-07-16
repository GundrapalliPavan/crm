# Local Development Setup

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable` will provide it)
- Docker + Docker Compose (for Postgres/Redis, and optional containerized backend/frontend)

## Install

```bash
git clone <repo-url>
cd crm-platform
nvm use          # or ensure Node 22 is active
corepack enable
pnpm install
```

## Environment Files

Copy each app's example env file:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp mobile/.env.example mobile/.env
cp infrastructure/.env.example infrastructure/.env
```

## Start Datastores

```bash
pnpm docker:up      # postgres + redis (+ backend + frontend, if desired)
```

## Run Apps

```bash
pnpm dev:backend    # http://localhost:4000
pnpm dev:frontend   # http://localhost:3000
pnpm dev:mobile     # Expo dev server
```

## Common Scripts

| Command | Description |
| --- | --- |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm test` | Run tests in all workspaces |
| `pnpm build` | Build backend + frontend |
| `pnpm format` | Format the repo with Prettier |

## Status

This repository currently contains foundation/scaffolding only (no database
models, APIs, or UI screens). See
[`docs/sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md`](sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md)
for the implementation order that follows this foundation.
