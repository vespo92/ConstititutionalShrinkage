# Constitutional Shrinkage - Auth Service Dockerfile
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
COPY services/auth-service/package.json ./services/auth-service/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# ==========================================================================
# Builder Stage
# ==========================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/auth-service/node_modules ./services/auth-service/node_modules 2>/dev/null || true
COPY . .
ENV NODE_ENV=production
RUN corepack enable pnpm && pnpm build --filter=auth-service

# ==========================================================================
# Production Stage
# ==========================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3002

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy built application
COPY --from=builder --chown=nodeuser:nodejs /app/services/auth-service/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/services/auth-service/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules

USER nodeuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]
