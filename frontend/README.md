# CRM Platform - Frontend

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.

See [`docs/sds/volume-7-engineering/08_Frontend_Architecture.md`](../docs/sds/volume-7-engineering/08_Frontend_Architecture.md) for the full architecture specification.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4 + shadcn/ui (New York style, configured via `components.json`)
- TanStack Query (server state) / TanStack Table
- React Hook Form + Zod
- Axios API client

## Getting Started

```bash
# from repo root
pnpm install
cp frontend/.env.example frontend/.env.local

pnpm dev:frontend
```

## Project Structure

```
app/                # routes (App Router) - (auth), (dashboard) route groups
components/         # shared, reusable UI (common, forms, tables, charts, layouts, feedback, ui)
features/            # feature-first modules (auth, leads, orders, ...) each with
                     #   components/ hooks/ pages/ services/ schemas/ types/
hooks/               # shared hooks
lib/                 # shared libs (cn() helper, etc.)
services/            # centralized API client
types/               # shared TypeScript types
utils/               # shared utilities
```

Adding shadcn/ui components once implementation starts:

```bash
pnpm dlx shadcn@latest add button
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |

## Status

Repository foundation only - no screens or business logic implemented yet.
