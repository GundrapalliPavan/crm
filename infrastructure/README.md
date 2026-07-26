# Infrastructure

Local development infrastructure via Docker Compose.

## Usage

```bash
cp .env.example .env
pnpm docker:up      # postgres
pnpm docker:down
```

Application processes run directly on the host, not in containers, for local development:

```bash
pnpm dev:api
pnpm dev:web
```

## Structure

```
docker-compose.yml   # postgres (at repo root, alongside .env)
scripts/              # operational scripts, added as needed
deployment/            # GCP deployment architecture, added when Phase 0 Step 13 begins
```

Redis and application container images are intentionally not configured yet - they are introduced
when the queue infrastructure and deployment steps actually need them, per `PROJECT_SETUP.md`
sections 23 ("Avoid Premature Infrastructure") and 31 ("Background Jobs").

Production deployment topology (Cloud Run, Cloud SQL, Secret Manager, TLS termination) is defined in
`PROJECT_SETUP.md` section 56 and will be implemented in Phase 0 Step 13, not repository initialization.
