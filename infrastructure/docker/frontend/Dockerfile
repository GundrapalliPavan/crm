# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter @crm/frontend...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend ./frontend
COPY tsconfig.base.json ./
RUN cd frontend && pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/frontend/.next ./frontend/.next
COPY --from=build /app/frontend/node_modules ./frontend/node_modules
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/frontend/public ./frontend/public
WORKDIR /app/frontend
EXPOSE 3000
CMD ["pnpm", "start"]
