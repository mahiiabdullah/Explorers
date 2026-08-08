# Backend Dockerfile — multi-stage for a small, secure production image.
# Builder compiles TS to JS via tsup; runtime only ships prod deps + dist.

# ---------- Stage 1: install deps & build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# OS deps for Prisma engines
RUN apk add --no-cache openssl

# Copy manifests first to leverage layer caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Install full deps and generate Prisma client
RUN npm ci && npx prisma generate

# Copy the rest of the source (includes prisma/seed.ts now that it's
# not in .dockerignore)
COPY src ./src

# Compile to ESM in ./dist — server.js + seed.js
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# openssl for Prisma client; wget for healthcheck
RUN apk add --no-cache openssl wget

# Run as non-root
RUN addgroup -S app && adduser -S app -G app

# Copy compiled output and Prisma artifacts (schema is needed by the engine)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# Install only production dependencies (Prisma engines ship here)
RUN npm ci --omit=dev && npm cache clean --force

USER app
EXPOSE 5000
ENV NODE_ENV=production

# Default command — overridden in docker-compose for first-boot migration + seed
CMD ["node", "dist/server.js"]