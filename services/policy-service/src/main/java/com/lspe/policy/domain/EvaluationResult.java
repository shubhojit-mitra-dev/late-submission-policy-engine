package com.lspe.policy.domain;

import com.lspe.common.enums.SubmissionStatus;

public record EvaluationResult(
        Double originalScore,
        Double latenessHours,
        Double effectiveLatenessHours,
        Double penaltyApplied,
        Double finalScore,
        SubmissionStatus status,
        String reason
) {}
