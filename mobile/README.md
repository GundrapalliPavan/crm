# CRM Platform - Mobile

React Native + Expo (Expo Router) application for field sales executives.

See [`docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md`](../docs/sds/volume-7-engineering/09_Mobile_App_Requirements.md) for the full requirements.

## Stack

- Expo (managed workflow) + Expo Router
- TanStack Query, React Hook Form + Zod
- Expo Location, Camera, Image Picker, Notifications, SecureStore

## Getting Started

```bash
# from repo root
pnpm install
cp mobile/.env.example mobile/.env

pnpm dev:mobile
```

## Project Structure

```
app/                 # Expo Router routes: (tabs)/ bottom nav, auth/ stack
components/          # shared, reusable UI
features/            # feature-first modules (leads, visits, orders, ...)
hooks/                # shared hooks
services/             # API client, shared with web via the same REST contracts
types/                # shared TypeScript types
utils/                # shared utilities
constants/            # app-wide constants (colors, config)
```

The mobile app consumes the same `/api/v1` REST endpoints as the web frontend -
no mobile-specific backend endpoints.

## Status

Repository foundation only - no screens or business logic implemented yet.
