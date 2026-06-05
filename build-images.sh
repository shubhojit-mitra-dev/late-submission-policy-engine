#!/bin/bash
set -e

NO_CACHE=""
if [ "$1" == "--no-cache" ]; then
  NO_CACHE="--no-cache"
fi

echo "Building Policy Service..."
docker build $NO_CACHE -t shubhojitmitradev/lspe-policy-service:latest -f services/policy-service/Dockerfile .

echo "Building Assignment Service..."
docker build $NO_CACHE -t shubhojitmitradev/lspe-assignment-service:latest -f services/assignment-service/Dockerfile .

echo "Building Submission Service..."
docker build $NO_CACHE -t shubhojitmitradev/lspe-submission-service:latest -f services/submission-service/Dockerfile .

echo "Building API Gateway..."
docker build $NO_CACHE -t shubhojitmitradev/lspe-api-gateway:latest -f services/api-gateway/Dockerfile .

echo "All images built successfully!"

