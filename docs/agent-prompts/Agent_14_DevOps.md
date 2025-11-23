# Agent_14: DevOps & CI/CD Enhancement

## Mission
Enhance the DevOps infrastructure including CI/CD pipelines, Docker containerization, Kubernetes manifests, monitoring/alerting, and security scanning to enable reliable deployment and operation of the platform.

## Branch
```
claude/agent-14-devops-{session-id}
```

## Priority: HIGH

## Context
Current state:
- Basic GitHub Actions CI pipeline exists
- Docker Compose for local development
- No containerization for services
- No Kubernetes manifests
- No monitoring infrastructure

Target state:
- Enhanced CI/CD with staging/production deployments
- All services containerized
- Kubernetes-ready manifests
- Monitoring and alerting configured
- Security scanning integrated

## Target Directories
```
.github/
infrastructure/
```

## Your Deliverables

### 1. Enhanced GitHub Actions Workflows

#### CI Pipeline (ci.yml)
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: constitutional_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/constitutional_test
          REDIS_URL: redis://localhost:6379
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            apps/*/dist
            apps/*/.next
            services/*/dist

  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

#### Staging Deployment (cd-staging.yml)
```yaml
# .github/workflows/cd-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ${{ github.repository }}

jobs:
  build-images:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - notification-service
          - search-service
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/docker/${{ matrix.service }}.Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:staging
            ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-images
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
          export KUBECONFIG=./kubeconfig

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -k infrastructure/kubernetes/overlays/staging
          kubectl rollout status deployment/api-gateway -n constitutional-staging
```

#### Security Scanning (security-scan.yml)
```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: '8'
      - run: pnpm audit --audit-level=high

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v2
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v2

  container-scan:
    runs-on: ubuntu-latest
    needs: [dependency-audit]
    strategy:
      matrix:
        service: [api-gateway, auth-service]
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: |
          docker build -f infrastructure/docker/${{ matrix.service }}.Dockerfile \
            -t ${{ matrix.service }}:scan .
      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ matrix.service }}:scan'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### 2. Dockerfiles for Services

```dockerfile
# infrastructure/docker/api-gateway.Dockerfile
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/api-gateway/package.json ./services/api-gateway/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build --filter=api-gateway

# Production
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser
COPY --from=builder /app/services/api-gateway/dist ./dist
COPY --from=builder /app/services/api-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nodeuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

```dockerfile
# infrastructure/docker/auth-service.Dockerfile
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/auth-service/package.json ./services/auth-service/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build --filter=auth-service

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nodeuser
EXPOSE 3002
CMD ["node", "dist/index.js"]
```

```dockerfile
# infrastructure/docker/frontend.Dockerfile
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/citizen-portal/package.json ./apps/citizen-portal/
COPY packages/*/package.json ./packages/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable pnpm && pnpm build --filter=citizen-portal

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/citizen-portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/citizen-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/citizen-portal/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### 3. Enhanced Docker Compose

```yaml
# infrastructure/docker-compose.yml
version: '3.8'

services:
  # Databases
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: constitutional
      POSTGRES_PASSWORD: constitutional_dev_2025
      POSTGRES_DB: constitutional_shrinkage
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/postgres/schema:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U constitutional"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:9200/_cluster/health | grep -q '\"status\":\"green\"\\|\"status\":\"yellow\"'"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Services (for full local development)
  api-gateway:
    build:
      context: ..
      dockerfile: infrastructure/docker/api-gateway.Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://constitutional:constitutional_dev_2025@postgres:5432/constitutional_shrinkage
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  auth-service:
    build:
      context: ..
      dockerfile: infrastructure/docker/auth-service.Dockerfile
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://constitutional:constitutional_dev_2025@postgres:5432/constitutional_shrinkage
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-production}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  notification-service:
    build:
      context: ..
      dockerfile: infrastructure/docker/notification-service.Dockerfile
    ports:
      - "3003:3003"
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy

  search-service:
    build:
      context: ..
      dockerfile: infrastructure/docker/search-service.Dockerfile
    ports:
      - "3004:3004"
    environment:
      ELASTICSEARCH_URL: http://elasticsearch:9200
      DATABASE_URL: postgresql://constitutional:constitutional_dev_2025@postgres:5432/constitutional_shrinkage
    depends_on:
      elasticsearch:
        condition: service_healthy
      postgres:
        condition: service_healthy

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: constitutional_network
```

### 4. Kubernetes Manifests

```yaml
# infrastructure/kubernetes/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: constitutional
  labels:
    app.kubernetes.io/name: constitutional-shrinkage
```

```yaml
# infrastructure/kubernetes/base/api-gateway/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: constitutional
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: ghcr.io/vespo92/constitutional-shrinkage/api-gateway:latest
          ports:
            - containerPort: 3001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: url
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
```

```yaml
# infrastructure/kubernetes/base/api-gateway/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: constitutional
spec:
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 3001
  type: ClusterIP
```

```yaml
# infrastructure/kubernetes/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: constitutional-ingress
  namespace: constitutional
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.constitutional.dev
        - app.constitutional.dev
      secretName: constitutional-tls
  rules:
    - host: api.constitutional.dev
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80
    - host: app.constitutional.dev
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: citizen-portal
                port:
                  number: 80
```

### 5. Monitoring Configuration

```yaml
# infrastructure/monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alerts/*.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3001']
    metrics_path: '/metrics'

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3002']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

```yaml
# infrastructure/monitoring/prometheus/alerts/api.yml
groups:
  - name: api-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate on {{ $labels.service }}

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency on {{ $labels.service }}

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Service {{ $labels.job }} is down
```

### 6. Helper Scripts

```bash
# infrastructure/scripts/setup-dev.sh
#!/bin/bash
set -e

echo "Setting up development environment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required"; exit 1; }

# Start infrastructure
echo "Starting databases..."
docker-compose -f infrastructure/docker-compose.yml up -d postgres redis elasticsearch

# Wait for services
echo "Waiting for services to be healthy..."
sleep 10

# Run migrations
echo "Running database migrations..."
pnpm prisma migrate deploy

# Seed data
echo "Seeding development data..."
pnpm prisma db seed

echo "Development environment ready!"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo "- Elasticsearch: localhost:9200"
```

```bash
# infrastructure/scripts/run-migrations.sh
#!/bin/bash
set -e

echo "Running database migrations..."
pnpm prisma migrate deploy

echo "Migrations complete!"
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 35-40 |
| Workflows | 5-6 |
| Dockerfiles | 5-6 |
| K8s Manifests | 15-20 |

## Success Criteria

1. [ ] CI pipeline running all checks
2. [ ] Staging deployment automated
3. [ ] All services containerized
4. [ ] Kubernetes manifests valid
5. [ ] Monitoring dashboards created
6. [ ] Security scanning integrated
7. [ ] Helper scripts working
8. [ ] Documentation complete

---

*Agent_14 Assignment - DevOps & CI/CD*
