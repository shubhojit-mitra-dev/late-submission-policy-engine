#!/bin/bash

# ==========================================
# Comprehensive E2E Test Suite via API Gateway
# Target: http://localhost:8080
# ==========================================

GATEWAY="http://localhost:8080"
DB_CONTAINER="lspe-postgres"
DB_USER="lspe_user"
DB_NAME="lspe_db"

echo -e "\n=========================================="
echo " SETUP PHASE"
echo "=========================================="

echo ">>> Creating Lenient Policy"
LENIENT_RES=$(curl -s -X POST "$GATEWAY/api/policies" -H "Content-Type: application/json" -d '{
  "name": "Lenient Policy", "description": "FIXED, 5 marks, 48h grace, 14 days reject", "penaltyType": "FIXED", "penaltyValue": 5.0, "graceHours": 48.0, "maxPenalty": 50.0, "rejectAfterDays": 14, "active": true
}')
LENIENT_ID=$(echo $LENIENT_RES | jq -r '.data.id')
LENIENT_V1=$(curl -s "$GATEWAY/api/policies/$LENIENT_ID/versions" | jq -r '.data[0].id')

echo ">>> Creating Standard Policy"
STANDARD_RES=$(curl -s -X POST "$GATEWAY/api/policies" -H "Content-Type: application/json" -d '{
  "name": "Standard Policy", "description": "PERCENTAGE, 10%, 24h grace", "penaltyType": "PERCENTAGE", "penaltyValue": 10.0, "graceHours": 24.0, "maxPenalty": 50.0, "rejectAfterDays": 7, "active": true
}')
STANDARD_ID=$(echo $STANDARD_RES | jq -r '.data.id')
STANDARD_V1=$(curl -s "$GATEWAY/api/policies/$STANDARD_ID/versions" | jq -r '.data[0].id')

echo ">>> Creating Strict Policy"
STRICT_RES=$(curl -s -X POST "$GATEWAY/api/policies" -H "Content-Type: application/json" -d '{
  "name": "Strict Policy", "description": "PERCENTAGE, 25%, 0h grace", "penaltyType": "PERCENTAGE", "penaltyValue": 25.0, "graceHours": 0.0, "maxPenalty": 100.0, "rejectAfterDays": 2, "active": true
}')
STRICT_ID=$(echo $STRICT_RES | jq -r '.data.id')
STRICT_V1=$(curl -s "$GATEWAY/api/policies/$STRICT_ID/versions" | jq -r '.data[0].id')

echo ">>> Creating Assignments"
DUE_DATE=$(date -u -d '+5 days' +'%Y-%m-%dT%H:%M:%S')

CS101_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"CS101 Assignment\",\"courseCode\":\"CS101\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$CS101_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$LENIENT_V1\"}" > /dev/null

CS201_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"CS201 Assignment\",\"courseCode\":\"CS201\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$CS201_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\"}" > /dev/null

CS301_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"CS301 Assignment\",\"courseCode\":\"CS301\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$CS301_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STRICT_V1\"}" > /dev/null

CS401_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"CS401 Assignment\",\"courseCode\":\"CS401\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')

echo "Setup Complete!"

echo -e "\n=========================================="
echo " POLICY SERVICE TESTS"
echo "=========================================="

echo ">>> Test P1: GET all policies (Expecting multiple)"
sleep 1
curl -s "$GATEWAY/api/policies" | jq '.data | length'

echo ">>> Test P2: GET policy by ID"
sleep 1
curl -s "$GATEWAY/api/policies/$STANDARD_ID" | jq '.data.name'

echo ">>> Test P3: GET policy by fake ID"
sleep 1
curl -s "$GATEWAY/api/policies/invalid-id" | jq '.message'

echo ">>> Test P4: UPDATE Standard Policy -> penaltyValue 15%"
sleep 1
curl -s -X PUT "$GATEWAY/api/policies/$STANDARD_ID" -H "Content-Type: application/json" -d '{
  "name": "Standard Policy Updated", "description": "PERCENTAGE, 15%, 24h grace", "penaltyType": "PERCENTAGE", "penaltyValue": 15.0, "graceHours": 24.0, "maxPenalty": 50.0, "rejectAfterDays": 7, "active": true
}' | jq '.data.penaltyValue'

echo ">>> Test P5: GET versions for Standard Policy"
sleep 1
curl -s "$GATEWAY/api/policies/$STANDARD_ID/versions" | jq '.data | length'

STANDARD_V2=$(curl -s "$GATEWAY/api/policies/$STANDARD_ID/versions" | jq -r '.data[1].id')

echo ">>> Test P6: GET version 1 (10%)"
sleep 1
curl -s "$GATEWAY/api/policies/versions/$STANDARD_V1" | jq '.data.penaltyValue'

echo ">>> Test P7: GET version 2 (15%)"
sleep 1
curl -s "$GATEWAY/api/policies/versions/$STANDARD_V2" | jq '.data.penaltyValue'

echo ">>> Test P8: EVALUATE via gateway -> use version 1 (10%), score=90, hoursLate=30"
sleep 1
curl -s -X POST "$GATEWAY/api/policies/evaluate" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\",\"originalScore\":90,\"hoursLate\":30}" | jq '.data'

echo ">>> Test P9: EVALUATE -> score=90, hoursLate=10 (within grace)"
sleep 1
curl -s -X POST "$GATEWAY/api/policies/evaluate" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\",\"originalScore\":90,\"hoursLate\":10}" | jq '.data'

echo ">>> Test P10: SOFT DELETE Lenient Policy"
sleep 1
curl -s -X DELETE "$GATEWAY/api/policies/$LENIENT_ID" | jq '.success'

echo ">>> Test P11: GET deleted policy"
sleep 1
curl -s "$GATEWAY/api/policies/$LENIENT_ID" | jq '.message'


echo -e "\n=========================================="
echo " ASSIGNMENT SERVICE TESTS"
echo "=========================================="

echo ">>> Test A1: GET all assignments"
sleep 1
curl -s "$GATEWAY/api/assignments" | jq '.data | length'

echo ">>> Test A2: GET CS401 (no policy)"
sleep 1
curl -s "$GATEWAY/api/assignments/$CS401_ID" | jq '.data.activePolicyMapping'

echo ">>> Test A3: GET CS101 (populated policy)"
sleep 1
curl -s "$GATEWAY/api/assignments/$CS101_ID" | jq '.data.activePolicyMapping.policyVersionId'

echo ">>> Test A4: REASSIGN policy on CS101 to Standard Policy v2"
sleep 1
curl -s -X POST "$GATEWAY/api/assignments/$CS101_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V2\"}" | jq '.success'

echo ">>> Test A5: GET policy history for CS101"
sleep 1
curl -s "$GATEWAY/api/assignments/$CS101_ID/policy/history" | jq '.data | length'

echo ">>> Test A6: ASSIGN fake policy version"
sleep 1
curl -s -X POST "$GATEWAY/api/assignments/$CS101_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"fake-version-id\"}" | jq '.message'

echo ">>> Test A7: UPDATE CS201 title and dueDate"
sleep 1
NEW_DATE=$(date -u -d '+10 days' +'%Y-%m-%dT%H:%M:%S')
curl -s -X PUT "$GATEWAY/api/assignments/$CS201_ID" -H "Content-Type: application/json" -d "{\"title\":\"CS201 Updated\",\"courseCode\":\"CS201\",\"dueDate\":\"$NEW_DATE\",\"createdBy\":\"system\"}" | jq '.data.title'

echo ">>> Test A8: CREATE assignment with past due date"
sleep 1
PAST_DATE=$(date -u -d '-1 days' +'%Y-%m-%dT%H:%M:%S')
curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"Past Assignment\",\"courseCode\":\"PAST\",\"dueDate\":\"$PAST_DATE\",\"createdBy\":\"system\"}" | jq '.message'

echo ">>> Test A9: GET fake assignment ID"
sleep 1
curl -s "$GATEWAY/api/assignments/fake-id" | jq '.message'


echo -e "\n=========================================="
echo " SUBMISSION SERVICE TESTS"
echo "=========================================="
NOW=$(date -u +'%Y-%m-%dT%H:%M:%S')

echo ">>> Test S1: Submit to CS201 (Standard v1, on time)"
sleep 1
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS201_ID\",\"studentIdentifier\":\"stu-s1\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied, finalScore: .data.result.finalScore}'

echo ">>> Test S2: Submit to CS201 (Late 10h, within grace)"
sleep 1
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '10 hours' WHERE id = '$CS201_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS201_ID\",\"studentIdentifier\":\"stu-s2\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied, finalScore: .data.result.finalScore}'

echo ">>> Test S3: Submit to CS201 (Late 30h, beyond grace, 10% penalty on 85 = 8.5)"
sleep 1
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '30 hours' WHERE id = '$CS201_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS201_ID\",\"studentIdentifier\":\"stu-s3\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied, finalScore: .data.result.finalScore}'

echo ">>> Test S4: Submit to CS201 (Late 200h, beyond 7 days)"
sleep 1
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '200 hours' WHERE id = '$CS201_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS201_ID\",\"studentIdentifier\":\"stu-s4\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, finalScore: .data.result.finalScore}'

echo ">>> Test S5: Submit to CS301 (Strict v1, Late 1h, 0h grace, 25% penalty)"
sleep 1
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '1 hour' WHERE id = '$CS301_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS301_ID\",\"studentIdentifier\":\"stu-s5\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied, finalScore: .data.result.finalScore}'

echo ">>> Test S6: Submit to CS301 (Late 60h, beyond 2 days)"
sleep 1
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '60 hours' WHERE id = '$CS301_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS301_ID\",\"studentIdentifier\":\"stu-s6\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '{status: .data.result.status, finalScore: .data.result.finalScore}'

echo ">>> Test S7: Submit to CS401 (no policy)"
sleep 1
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS401_ID\",\"studentIdentifier\":\"stu-s7\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '.message'

echo ">>> Test S8: Submit with fake assignmentId"
sleep 1
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"fake-id\",\"studentIdentifier\":\"stu-s8\",\"submittedAt\":\"$NOW\",\"originalScore\":85.0}" | jq '.message'

echo ">>> Test S9: Submit with score=0 (Edge case)"
sleep 1
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$CS301_ID\",\"studentIdentifier\":\"stu-s9\",\"submittedAt\":\"$NOW\",\"originalScore\":0.0}" | jq '{status: .data.result.status, finalScore: .data.result.finalScore}'

echo ">>> Test S10: GET submissions by assignment (CS201)"
sleep 1
curl -s "$GATEWAY/api/submissions/assignment/$CS201_ID" | jq '.data | length'

echo ">>> Test S11: GET submissions by student"
sleep 1
curl -s "$GATEWAY/api/submissions/student/stu-s3" | jq '.data | length' > /dev/null # Suppressing list length
curl -s "$GATEWAY/api/submissions/student/stu-s3" | jq -r '.data[0].studentIdentifier'

echo ">>> Test S12: GET submission by ID"
sleep 1
SUBMISSION_ID=$(curl -s "$GATEWAY/api/submissions/student/stu-s3" | jq -r '.data[0].id')
curl -s "$GATEWAY/api/submissions/$SUBMISSION_ID" | jq '{id: .data.id, reason: .data.result.reason}'

echo ">>> Test S13: GET fake submission ID"
sleep 1
curl -s "$GATEWAY/api/submissions/fake-id" | jq '.message'


echo -e "\n=========================================="
echo " CROSS-CUTTING SCENARIOS"
echo "=========================================="

echo ">>> Test X1: Full student journey - happy path"
sleep 1
X1_AS_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"X1 Happy Path\",\"courseCode\":\"X1\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$X1_AS_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\"}" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X1_AS_ID\",\"studentIdentifier\":\"stu-x1\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied}'

echo ">>> Test X2: Full student journey - late penalty"
sleep 1
X2_AS_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"X2 Late Path\",\"courseCode\":\"X2\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$X2_AS_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\"}" > /dev/null
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '48 hours' WHERE id = '$X2_AS_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X2_AS_ID\",\"studentIdentifier\":\"stu-x2\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied}'

echo ">>> Test X3: Policy version integrity"
sleep 1
# Submit to X1 using v1
SUB1_RES=$(curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X1_AS_ID\",\"studentIdentifier\":\"stu-x3-v1\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}")
# Reassign X1 to v2 (15% penalty)
curl -s -X POST "$GATEWAY/api/assignments/$X1_AS_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V2\"}" > /dev/null
# Manipulate due date to trigger penalty
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '30 hours' WHERE id = '$X1_AS_ID';" > /dev/null
# Submit to X1 using v2
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X1_AS_ID\",\"studentIdentifier\":\"stu-x3-v2\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{status: .data.result.status, penalty: .data.result.penaltyApplied}'
# Check v1 submission still has v1 policy
echo $SUB1_RES | jq '{student: .data.studentIdentifier, policyVersion: .data.result.policyVersionId}'

echo ">>> Test X4: Multiple students same assignment"
sleep 1
X4_AS_ID=$(curl -s -X POST "$GATEWAY/api/assignments" -H "Content-Type: application/json" -d "{\"title\":\"X4 Multi-Student\",\"courseCode\":\"X4\",\"dueDate\":\"$DUE_DATE\",\"createdBy\":\"system\"}" | jq -r '.data.id')
curl -s -X POST "$GATEWAY/api/assignments/$X4_AS_ID/policy" -H "Content-Type: application/json" -d "{\"policyVersionId\":\"$STANDARD_V1\"}" > /dev/null

# A: On time (due date is future)
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X4_AS_ID\",\"studentIdentifier\":\"stu-A\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{student: .data.studentIdentifier, status: .data.result.status}'

# B: Late grace (due date 10h ago)
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '10 hours' WHERE id = '$X4_AS_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X4_AS_ID\",\"studentIdentifier\":\"stu-B\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{student: .data.studentIdentifier, status: .data.result.status}'

# C: Late penalty (due date 30h ago)
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "UPDATE assignment_schema.assignments SET due_date = NOW() - INTERVAL '30 hours' WHERE id = '$X4_AS_ID';" > /dev/null
curl -s -X POST "$GATEWAY/api/submissions" -H "Content-Type: application/json" -d "{\"assignmentId\":\"$X4_AS_ID\",\"studentIdentifier\":\"stu-C\",\"submittedAt\":\"$NOW\",\"originalScore\":100.0}" | jq '{student: .data.studentIdentifier, status: .data.result.status}'


echo -e "\n=========================================="
echo " CLEANUP PHASE"
echo "=========================================="

echo ">>> Deleting Assignments (via DB script as delete endpoints may not exist)"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "DELETE FROM assignment_schema.assignment_policies;" > /dev/null
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "DELETE FROM assignment_schema.assignments;" > /dev/null

echo ">>> Soft-deleting Policies"
curl -s -X DELETE "$GATEWAY/api/policies/$STANDARD_ID" > /dev/null
curl -s -X DELETE "$GATEWAY/api/policies/$STRICT_ID" > /dev/null

echo ">>> Verifying deletions"
curl -s "$GATEWAY/api/assignments" | jq '.data | length'
curl -s "$GATEWAY/api/policies/$STANDARD_ID" | jq '.message'

echo -e "\n=========================================="
echo " E2E TEST SUITE COMPLETE"
echo "=========================================="
