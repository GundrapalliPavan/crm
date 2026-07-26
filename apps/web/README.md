# CRM Platform - Web Application

Vite + React + TypeScript + Tailwind CSS.

See [`FRONTEND.md`](../../prompts/FRONTEND.md) and [`PROJECT_SETUP.md`](../../PROJECT_SETUP.md) for the full architecture specification.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- React Router (client-side routing)
- TanStack Query (server state)
- React Hook Form + Zod (forms and validation)
- Axios API client

## Getting Started

```bash
# from repo root
pnpm install
cp apps/web/.env.example apps/web/.env

pnpm dev:web
```

## Project Structure

```
src/
├── app/                # App shell: router, providers, environment config
├── assets/             # Static assets bundled by Vite
├── components/         # Shared, reusable UI (common, layout)
├── features/           # Feature-first modules, added as modules are implemented
├── hooks/               # Shared hooks
├── lib/                # api/ (HTTP client), auth/, validation/
├── pages/               # Route-level page components
├── services/            # Feature-level API service functions
├── styles/              # Global styles (Tailwind entry point)
├── types/                # Shared TypeScript types
└── utils/                # Shared utilities (e.g. cn() classname helper)
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Run tests (Vitest) |

## Status

Repository foundation only - no screens or business logic implemented yet.
