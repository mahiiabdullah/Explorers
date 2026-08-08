# Gateway Dockerfile — tiny runtime image for the mock payment service.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY src ./src

RUN npm ci && npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# wget for healthcheck
RUN apk add --no-cache wget
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist

RUN npm ci --omit=dev && npm cache clean --force

USER app
EXPOSE 9000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]