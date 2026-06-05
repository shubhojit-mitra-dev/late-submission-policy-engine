package com.lspe.submission.domain;

import com.lspe.common.enums.PenaltyType;
import com.lspe.common.enums.SubmissionStatus;
import com.lspe.submission.dto.response.PolicyVersionDetailResponse;
import org.springframework.stereotype.Service;

@Service
public class EvaluationEngine {

    public record EvaluationResult(
            double penaltyApplied,
            double finalScore,
            double effectiveLatenessHours,
            SubmissionStatus status,
            String reason
    ) {}

    public EvaluationResult evaluate(PolicyVersionDetailResponse policyVersion, Double originalScore, Double hoursLate) {
        
        // Check hard deadline rejection:
        if (policyVersion.getRejectAfterDays() != null && hoursLate > (policyVersion.getRejectAfterDays() * 24.0)) {
            return new EvaluationResult(
                    0.0,
                    0.0,
                    hoursLate,
                    SubmissionStatus.REJECTED,
                    "Submission rejected: exceeds hard deadline"
            );
        }

        // Calculate effective lateness:
        double effectiveLatenessHours = Math.max(0.0, hoursLate - (policyVersion.getGraceHours() != null ? policyVersion.getGraceHours() : 0.0));

        if (0.0 == effectiveLatenessHours) {
            return new EvaluationResult(
                    0.0,
                    originalScore,
                    effectiveLatenessHours,
                    SubmissionStatus.ACCEPTED,
                    "Within grace period"
            );
        }

        // Calculate penalty based on type:
        double penalty = 0.0;
        PenaltyType type = PenaltyType.valueOf(policyVersion.getPenaltyType());
        if (type == PenaltyType.PERCENTAGE) {
            penalty = originalScore * (policyVersion.getPenaltyValue() / 100.0);
        } else if (type == PenaltyType.FIXED) {
            penalty = policyVersion.getPenaltyValue();
        }

        // Apply max penalty cap:
        if (policyVersion.getMaxPenalty() != null) {
            penalty = Math.min(penalty, policyVersion.getMaxPenalty());
        }

        // Calculate final score:
        double finalScore = Math.max(0.0, originalScore - penalty);

        return new EvaluationResult(
                penalty,
                finalScore,
                effectiveLatenessHours,
                SubmissionStatus.LATE_ACCEPTED,
                "Late submission: penalty applied"
        );
    }
}
