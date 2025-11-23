#!/bin/bash
# Constitutional Shrinkage - Development Environment Setup
# Agent_14: DevOps & CI/CD Enhancement
#
# Usage: ./setup-dev.sh [options]
#   --full      Start all services including apps
#   --tools     Include development tools (pgadmin, redis-commander)
#   --monitoring Include monitoring stack (prometheus, grafana)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
FULL_STACK=false
INCLUDE_TOOLS=false
INCLUDE_MONITORING=false

for arg in "$@"; do
    case $arg in
        --full)
            FULL_STACK=true
            ;;
        --tools)
            INCLUDE_TOOLS=true
            ;;
        --monitoring)
            INCLUDE_MONITORING=true
            ;;
        --help)
            echo "Usage: ./setup-dev.sh [options]"
            echo ""
            echo "Options:"
            echo "  --full        Start all services including apps"
            echo "  --tools       Include development tools (pgadmin, redis-commander)"
            echo "  --monitoring  Include monitoring stack (prometheus, grafana)"
            echo "  --help        Show this help message"
            exit 0
            ;;
    esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Constitutional Shrinkage - Dev Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is required but not installed.${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is required but not installed.${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Warning: pnpm is not installed. Installing via corepack...${NC}"
    corepack enable pnpm || npm install -g pnpm
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Navigate to infrastructure directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$INFRA_DIR")"

cd "$INFRA_DIR"

# Build compose profiles
PROFILES=""
if [ "$FULL_STACK" = true ]; then
    PROFILES="$PROFILES --profile services"
fi
if [ "$INCLUDE_TOOLS" = true ]; then
    PROFILES="$PROFILES --profile tools"
fi
if [ "$INCLUDE_MONITORING" = true ]; then
    PROFILES="$PROFILES --profile monitoring"
fi

# Start infrastructure
echo -e "${YELLOW}Starting database services...${NC}"
docker compose up -d postgres redis elasticsearch

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U constitutional &> /dev/null; do
    echo -n "."
    sleep 2
done
echo -e " ${GREEN}✓${NC}"

# Wait for Redis
echo -n "Waiting for Redis..."
until docker compose exec -T redis redis-cli ping &> /dev/null; do
    echo -n "."
    sleep 2
done
echo -e " ${GREEN}✓${NC}"

# Wait for Elasticsearch
echo -n "Waiting for Elasticsearch..."
until curl -s http://localhost:9200/_cluster/health &> /dev/null; do
    echo -n "."
    sleep 5
done
echo -e " ${GREEN}✓${NC}"

echo ""

# Start additional profiles if specified
if [ -n "$PROFILES" ]; then
    echo -e "${YELLOW}Starting additional services...${NC}"
    docker compose $PROFILES up -d
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd "$ROOT_DIR"
pnpm install

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
if [ -f "package.json" ] && grep -q '"prisma"' package.json; then
    pnpm prisma migrate deploy 2>/dev/null || echo "Note: Prisma migrations not configured yet"
fi

# Seed development data
echo -e "${YELLOW}Seeding development data...${NC}"
if [ -f "package.json" ] && grep -q '"db:seed"' package.json; then
    pnpm db:seed 2>/dev/null || echo "Note: Database seeding not configured yet"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Development environment ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services available at:"
echo -e "  ${GREEN}PostgreSQL:${NC}    localhost:5432"
echo -e "  ${GREEN}Redis:${NC}         localhost:6379"
echo -e "  ${GREEN}Elasticsearch:${NC} localhost:9200"

if [ "$INCLUDE_TOOLS" = true ]; then
    echo -e "  ${GREEN}pgAdmin:${NC}       http://localhost:5050"
    echo -e "  ${GREEN}Redis Commander:${NC} http://localhost:8081"
fi

if [ "$INCLUDE_MONITORING" = true ]; then
    echo -e "  ${GREEN}Prometheus:${NC}    http://localhost:9090"
    echo -e "  ${GREEN}Grafana:${NC}       http://localhost:3030 (admin/admin)"
fi

echo ""
echo "To start the full stack, run:"
echo -e "  ${YELLOW}pnpm dev${NC}"
echo ""
