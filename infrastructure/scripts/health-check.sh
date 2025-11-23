#!/bin/bash
# Constitutional Shrinkage - Health Check Script
# Agent_14: DevOps & CI/CD Enhancement
#
# Usage: ./health-check.sh [environment]
#   environment: local, staging, production (default: local)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default environment
ENVIRONMENT="${1:-local}"

# Set base URLs based on environment
case $ENVIRONMENT in
    local)
        API_URL="http://localhost:3001"
        AUTH_URL="http://localhost:3002"
        NOTIFICATION_URL="http://localhost:3003"
        SEARCH_URL="http://localhost:3004"
        FRONTEND_URL="http://localhost:3000"
        ;;
    staging)
        API_URL="https://api-staging.constitutional.dev"
        AUTH_URL="https://api-staging.constitutional.dev/auth"
        NOTIFICATION_URL="https://api-staging.constitutional.dev/notifications"
        SEARCH_URL="https://api-staging.constitutional.dev/search"
        FRONTEND_URL="https://app-staging.constitutional.dev"
        ;;
    production)
        API_URL="https://api.constitutional.dev"
        AUTH_URL="https://api.constitutional.dev/auth"
        NOTIFICATION_URL="https://api.constitutional.dev/notifications"
        SEARCH_URL="https://api.constitutional.dev/search"
        FRONTEND_URL="https://app.constitutional.dev"
        ;;
    *)
        echo -e "${RED}Unknown environment: $ENVIRONMENT${NC}"
        echo "Usage: ./health-check.sh [local|staging|production]"
        exit 1
        ;;
esac

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Constitutional Shrinkage - Health Check${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to check health endpoint
check_health() {
    local name="$1"
    local url="$2"
    local timeout="${3:-5}"

    printf "%-25s " "$name:"

    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$timeout" "$url/health" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    elif [ "$response" = "000" ]; then
        echo -e "${RED}✗ Unreachable${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠ Status: $response${NC}"
        return 1
    fi
}

# Track failures
FAILURES=0

# Check services
echo "Services:"
echo "---------"

check_health "API Gateway" "$API_URL" || ((FAILURES++))
check_health "Auth Service" "$AUTH_URL" || ((FAILURES++))
check_health "Notification Service" "$NOTIFICATION_URL" || ((FAILURES++))
check_health "Search Service" "$SEARCH_URL" || ((FAILURES++))

echo ""
echo "Frontend:"
echo "---------"
check_health "Citizen Portal" "$FRONTEND_URL" || ((FAILURES++))

# Check infrastructure (local only)
if [ "$ENVIRONMENT" = "local" ]; then
    echo ""
    echo "Infrastructure:"
    echo "---------------"

    # PostgreSQL
    printf "%-25s " "PostgreSQL:"
    if pg_isready -h localhost -p 5432 -U constitutional &> /dev/null; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${RED}✗ Unreachable${NC}"
        ((FAILURES++))
    fi

    # Redis
    printf "%-25s " "Redis:"
    if redis-cli -h localhost -p 6379 ping &> /dev/null; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${RED}✗ Unreachable${NC}"
        ((FAILURES++))
    fi

    # Elasticsearch
    printf "%-25s " "Elasticsearch:"
    es_status=$(curl -s "http://localhost:9200/_cluster/health" 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$es_status" = "green" ]; then
        echo -e "${GREEN}✓ Green${NC}"
    elif [ "$es_status" = "yellow" ]; then
        echo -e "${YELLOW}⚠ Yellow${NC}"
    elif [ "$es_status" = "red" ]; then
        echo -e "${RED}✗ Red${NC}"
        ((FAILURES++))
    else
        echo -e "${RED}✗ Unreachable${NC}"
        ((FAILURES++))
    fi
fi

echo ""
echo "========================================="

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAILURES health check(s) failed${NC}"
    exit 1
fi
