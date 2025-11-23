#!/bin/bash
# Constitutional Shrinkage - Database Migrations
# Agent_14: DevOps & CI/CD Enhancement
#
# Usage: ./run-migrations.sh [options]
#   --create <name>  Create a new migration
#   --deploy         Deploy pending migrations (default)
#   --reset          Reset database and re-run all migrations
#   --status         Show migration status
#   --seed           Run database seeding after migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default action
ACTION="deploy"
MIGRATION_NAME=""
RUN_SEED=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --create)
            ACTION="create"
            MIGRATION_NAME="$2"
            shift 2
            ;;
        --deploy)
            ACTION="deploy"
            shift
            ;;
        --reset)
            ACTION="reset"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --seed)
            RUN_SEED=true
            shift
            ;;
        --help)
            echo "Usage: ./run-migrations.sh [options]"
            echo ""
            echo "Options:"
            echo "  --create <name>  Create a new migration"
            echo "  --deploy         Deploy pending migrations (default)"
            echo "  --reset          Reset database and re-run all migrations"
            echo "  --status         Show migration status"
            echo "  --seed           Run database seeding after migration"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$ROOT_DIR"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL not set, using default development URL${NC}"
    export DATABASE_URL="postgresql://constitutional:constitutional_dev_2025@localhost:5432/constitutional_shrinkage"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Constitutional Shrinkage - Migrations${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

case $ACTION in
    create)
        if [ -z "$MIGRATION_NAME" ]; then
            echo -e "${RED}Error: Migration name is required${NC}"
            echo "Usage: ./run-migrations.sh --create <migration-name>"
            exit 1
        fi
        echo -e "${YELLOW}Creating new migration: ${MIGRATION_NAME}${NC}"
        pnpm prisma migrate dev --name "$MIGRATION_NAME"
        echo -e "${GREEN}✓ Migration created successfully${NC}"
        ;;
    deploy)
        echo -e "${YELLOW}Deploying pending migrations...${NC}"
        pnpm prisma migrate deploy
        echo -e "${GREEN}✓ Migrations deployed successfully${NC}"
        ;;
    reset)
        echo -e "${RED}WARNING: This will reset the database and delete all data!${NC}"
        read -p "Are you sure you want to continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Resetting database...${NC}"
            pnpm prisma migrate reset --force
            echo -e "${GREEN}✓ Database reset successfully${NC}"
        else
            echo "Aborted."
            exit 0
        fi
        ;;
    status)
        echo -e "${YELLOW}Migration status:${NC}"
        pnpm prisma migrate status
        ;;
esac

# Run seeding if requested
if [ "$RUN_SEED" = true ]; then
    echo ""
    echo -e "${YELLOW}Running database seeding...${NC}"
    pnpm prisma db seed
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
