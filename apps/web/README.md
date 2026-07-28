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

Authentication (login, protected routes), Module 1 (CRM & Lead Management - Leads, Contacts,
Companies, Follow-ups), Module 2 (Product Catalog - Products, Categories, Brands), Module 3
(Inventory - Stock, Stock Movements, Warehouses, adjustments/transfers), Module 4 (Sales -
Opportunities, Quotations, Sales Orders), Module 5 (Purchase - Supplier profile on the Company
detail page, Purchase Orders, Goods Receipts), Module 6 (Billing - Customer profile on the Company
detail page, Invoices, Payments), Module 7 (Reports & Analytics - a role-aware Dashboard at "/",
plus Leads/Sales/Inventory/Purchase/Billing/Outstanding/Team Performance report pages), Module 8
(Communication - Communications history, Templates management, a "Log Communication" action +
timeline slice embedded on Lead/Company/Invoice detail pages) and Module 9 (Team Management -
Teams list/detail with membership management, a Team filter on Lead/Quotation/Sales Order lists,
and a Team assignment control on Lead Detail) complete, with a real navigation shell
(`components/layout`).

Standalone Sales Order creation is deferred - orders are created via "Convert to Sales Order" on an
accepted quotation, matching API.md's recommended flow. Standalone Invoice creation follows the same
pattern - invoices are raised via "Create Invoice" on a confirmed Sales Order.
