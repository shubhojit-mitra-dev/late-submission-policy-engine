package com.lspe.policy.domain;

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

        // Waiting for the rest of the formula...
        return null;
    }
}
