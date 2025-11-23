# Constitutional Shrinkage - Notification Service Dockerfile
# Agent_14: DevOps & CI/CD Enhancement
# Multi-stage build for optimized production image

# ==========================================================================
# Base Stage
# ==========================================================================
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================================================
# Dependencies Stage
# ==========================================================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/notification-service/package.json ./services/notification-service/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# ==========================================================================
# Builder Stage
# ==========================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/notification-service/node_modules ./services/notification-service/node_modules 2>/dev/null || true
COPY . .
ENV NODE_ENV=production
RUN corepack enable pnpm && pnpm build --filter=notification-service

# ==========================================================================
# Production Stage
# ==========================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3003

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy built application
COPY --from=builder --chown=nodeuser:nodejs /app/services/notification-service/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/services/notification-service/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules

USER nodeuser

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

CMD ["node", "dist/index.js"]
