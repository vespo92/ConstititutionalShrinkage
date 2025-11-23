# Constitutional Shrinkage - Legislative App Dockerfile
# Agent_14: DevOps & CI/CD Enhancement
# Multi-stage build for Next.js application

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
COPY apps/legislative/package.json ./apps/legislative/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ==========================================================================
# Builder Stage
# ==========================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/legislative/node_modules ./apps/legislative/node_modules 2>/dev/null || true
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN corepack enable pnpm && pnpm build --filter=legislative

# ==========================================================================
# Production Stage
# ==========================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/legislative/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/legislative/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/legislative/.next/static ./.next/static

USER nextjs

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3005/api/health || exit 1

CMD ["node", "server.js"]
