package com.lspe.assignment.dto.response;

import java.time.LocalDateTime;

public record AssignmentPolicyResponse(
        String id,
        String assignmentId,
        String policyVersionId,
        Boolean active,
        LocalDateTime assignedAt
) {
}
