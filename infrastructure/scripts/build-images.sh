#!/bin/bash
# Constitutional Shrinkage - Docker Image Builder
# Agent_14: DevOps & CI/CD Enhancement
#
# Usage: ./build-images.sh [options] [services...]
#   --push          Push images after building
#   --tag <tag>     Tag for images (default: latest)
#   --registry <r>  Registry prefix (default: ghcr.io/vespo92/constitutional-shrinkage)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
PUSH_IMAGES=false
IMAGE_TAG="latest"
REGISTRY="ghcr.io/vespo92/constitutional-shrinkage"
SERVICES=()

# All available services
ALL_SERVICES=(
    "api-gateway"
    "auth-service"
    "notification-service"
    "search-service"
    "citizen-portal"
    "legislative-app"
)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH_IMAGES=true
            shift
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --all)
            SERVICES=("${ALL_SERVICES[@]}")
            shift
            ;;
        --help)
            echo "Usage: ./build-images.sh [options] [services...]"
            echo ""
            echo "Options:"
            echo "  --push           Push images after building"
            echo "  --tag <tag>      Tag for images (default: latest)"
            echo "  --registry <r>   Registry prefix"
            echo "  --all            Build all services"
            echo "  --help           Show this help message"
            echo ""
            echo "Available services:"
            for svc in "${ALL_SERVICES[@]}"; do
                echo "  - $svc"
            done
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            SERVICES+=("$1")
            shift
            ;;
    esac
done

# Default to all services if none specified
if [ ${#SERVICES[@]} -eq 0 ]; then
    SERVICES=("${ALL_SERVICES[@]}")
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$ROOT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Constitutional Shrinkage - Image Builder${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Registry: $REGISTRY"
echo "Tag: $IMAGE_TAG"
echo "Services: ${SERVICES[*]}"
echo ""

# Build each service
for service in "${SERVICES[@]}"; do
    DOCKERFILE="infrastructure/docker/${service}.Dockerfile"

    if [ ! -f "$DOCKERFILE" ]; then
        echo -e "${YELLOW}Warning: Dockerfile not found for $service, skipping...${NC}"
        continue
    fi

    IMAGE_NAME="${REGISTRY}/${service}:${IMAGE_TAG}"

    echo -e "${YELLOW}Building ${service}...${NC}"
    docker build \
        -f "$DOCKERFILE" \
        -t "$IMAGE_NAME" \
        --build-arg NODE_ENV=production \
        .

    echo -e "${GREEN}✓ Built: ${IMAGE_NAME}${NC}"

    if [ "$PUSH_IMAGES" = true ]; then
        echo -e "${YELLOW}Pushing ${IMAGE_NAME}...${NC}"
        docker push "$IMAGE_NAME"
        echo -e "${GREEN}✓ Pushed: ${IMAGE_NAME}${NC}"
    fi

    echo ""
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build complete!${NC}"
echo -e "${GREEN}========================================${NC}"

if [ "$PUSH_IMAGES" = false ]; then
    echo ""
    echo "To push images, run with --push flag"
fi
