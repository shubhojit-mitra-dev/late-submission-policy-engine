package com.lspe.assignment.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AssignPolicyRequest(
        @NotBlank(message = "Policy version ID is required") 
        String policyVersionId
) {
}
