package com.lspe.assignment.dto.response;

import java.time.LocalDateTime;

public record AssignmentResponse(
        String id,
        String title,
        String description,
        String courseCode,
        LocalDateTime dueDate,
        String createdBy,
        LocalDateTime createdAt,
        AssignmentPolicyResponse activePolicyMapping
) {
}
