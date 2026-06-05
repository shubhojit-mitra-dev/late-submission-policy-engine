package com.lspe.submission.dto.response;

import com.lspe.common.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultResponse {
    private String id;
    private String submissionId;
    private String policyVersionId;
    private Double rawScore;
    private Double penaltyApplied;
    private Double latenessHours;
    private Double effectiveLatenessHours;
    private Double finalScore;
    private SubmissionStatus status;
    private String reason;
    private LocalDateTime evaluatedAt;
}
