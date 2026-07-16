# Infrastructure

Local development infrastructure via Docker Compose.

## Usage

```bash
cp infrastructure/.env.example infrastructure/.env
pnpm docker:up    # postgres + redis + backend + frontend
pnpm docker:down
```

For local development without full containerization, run only the datastores:

```bash
docker compose -f infrastructure/docker-compose.yml up -d postgres redis
pnpm dev:backend
pnpm dev:frontend
```

## Structure

```
docker-compose.yml       # postgres, redis, backend, frontend services
docker/backend/Dockerfile
docker/frontend/Dockerfile
```

Production deployment topology (orchestration platform, TLS termination, secrets
management, autoscaling) is out of scope for this foundation and will be defined
once Volume 3 (Technical Architecture / Deployment Architecture) is authored -
see the gap noted in [`docs/README.md`](../docs/README.md).
