package com.lspe.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionEvaluationEvent implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long submissionId;
    private Long assignmentId;
    private Double originalScore;
    private LocalDateTime submittedAt;
    private LocalDateTime deadline;
}
