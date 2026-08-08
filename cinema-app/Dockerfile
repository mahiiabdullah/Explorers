# Frontend Dockerfile — Next.js standalone build on Alpine.
# Uses Next.js's `output: 'standalone'` mode for a slim production image
# (no node_modules, no .next/cache — only what's needed at runtime).

# ---------- Stage 1: deps + build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# libc6-compat is needed by sharp / next/image on Alpine
RUN apk add --no-cache libc6-compat

# Build-time config (passed by `docker compose build --build-arg` or the
# `args:` block in docker-compose.yml). NEXT_PUBLIC_* are inlined into the
# JS bundle at build time, so they must reflect the public LB URLs.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Manifests + config files first to maximise layer caching
COPY package.json package-lock.json* ./
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY postcss.config.mjs tailwind.config.ts ./

# Install all deps (incl. dev) for the build
RUN npm ci

# Source
COPY src ./src

# Build → produces .next/standalone + .next/static
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache libc6-compat wget
RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the standalone bundle, static assets, and any public/ dir
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public 2>/dev/null || true

USER app
EXPOSE 3000

CMD ["node", "server.js"]