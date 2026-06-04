package com.lspe.policy.domain;

import com.lspe.common.enums.PenaltyType;
import com.lspe.common.enums.SubmissionStatus;
import com.lspe.policy.entity.PolicyVersion;
import org.springframework.stereotype.Service;

@Service
public class PolicyEvaluationService {

    public EvaluationResult evaluate(PolicyVersion policy, Double originalScore, Double hoursLate) {
        
        // Check hard deadline rejection:
        if (policy.getRejectAfterDays() != null && hoursLate > (policy.getRejectAfterDays() * 24.0)) {
            return new EvaluationResult(
                    originalScore,
                    hoursLate,
                    hoursLate,
                    0.0,
                    0.0,
                    SubmissionStatus.REJECTED,
                    "Submission rejected: exceeds hard deadline"
            );
        }

        // Calculate effective lateness:
        double effectiveLatenessHours = Math.max(0.0, hoursLate - policy.getGraceHours());

        if (0.0 == effectiveLatenessHours) {
            return new EvaluationResult(
                    originalScore,
                    hoursLate,
                    effectiveLatenessHours,
                    0.0,
                    originalScore,
                    SubmissionStatus.ACCEPTED,
                    "Within grace period"
            );
        }

        // Step 4 — Calculate penalty based on type:
        double penalty = 0.0;
        if (policy.getPenaltyType() == PenaltyType.PERCENTAGE) {
            penalty = originalScore * (policy.getPenaltyValue() / 100.0);
        } else if (policy.getPenaltyType() == PenaltyType.FIXED) {
            penalty = policy.getPenaltyValue();
        }

        // Waiting for the rest of the formula...
        return null;
    }
}
