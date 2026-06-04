package com.lspe.policy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record EvaluationRequest(
        @NotNull(message = "Policy version ID is required")
        String policyVersionId,
        
        @NotNull(message = "Original score is required")
        @PositiveOrZero(message = "Original score cannot be negative")
        Double originalScore,
        
        @NotNull(message = "Hours late is required")
        @PositiveOrZero(message = "Hours late cannot be negative")
        Double hoursLate
) {}
