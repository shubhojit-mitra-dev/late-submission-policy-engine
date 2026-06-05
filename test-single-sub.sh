#!/bin/bash
GATEWAY="http://localhost:8080"
DUE_DATE=$(date -u -d '+5 days' +'%Y-%m-%dT%H:%M:%SZ')
NOW=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

P_ID=$(curl -s -X POST "$GATEWAY/api/policies" -H "Content-Type: application/json" -d '{"name":"Lenient","description":"test","penaltyType":"PERCENTAGE","penaltyValue":10.0,"graceHours":24.0}' | jq -r '.data.id')
V_ID=$(curl -s "$GATEWAY/api/policies/$P_ID/versions" | jq -r '.data[0].id')
A_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"CS101\",\"courseCode\":\"CS101\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"sys\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$A_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$V_ID\"}" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$A_ID\",\"studentIdentifier\":\"stu-01\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}"
