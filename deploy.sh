#!/bin/bash

VERSION="v0.0.1"
DOCKER_HUB_USER="alaxhuydv"
IMAGE_NAME="aladintech-co-v2"

# Build Docker image
echo "🚀 Building Docker image..."
docker build -t $DOCKER_HUB_USER/$IMAGE_NAME:$VERSION .
docker tag $DOCKER_HUB_USER/$IMAGE_NAME:$VERSION $DOCKER_HUB_USER/$IMAGE_NAME:latest

# Push Docker image to Docker Hub
echo "📤 Pushing Docker image to Docker Hub..."
docker push $DOCKER_HUB_USER/$IMAGE_NAME:$VERSION
docker push $DOCKER_HUB_USER/$IMAGE_NAME:latest

echo "✅ Deployment completed: $DOCKER_HUB_USER/$IMAGE_NAME:$VERSION"
