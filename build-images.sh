#!/bin/bash
set -e

echo "Building Policy Service..."
docker build -t shubhojitmitradev/lspe-policy-service:latest -f services/policy-service/Dockerfile .

echo "Building Assignment Service..."
docker build -t shubhojitmitradev/lspe-assignment-service:latest -f services/assignment-service/Dockerfile .

echo "Building Submission Service..."
docker build -t shubhojitmitradev/lspe-submission-service:latest -f services/submission-service/Dockerfile .

echo "Building API Gateway..."
docker build -t shubhojitmitradev/lspe-api-gateway:latest -f services/api-gateway/Dockerfile .

echo "All images built successfully!"
