package com.lspe.submission.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSubmissionRequest {

    @NotBlank(message = "Assignment ID is required")
    private String assignmentId;

    @NotBlank(message = "Student identifier is required")
    private String studentIdentifier;

    private String submissionUrl;

    @NotNull(message = "Submitted at timestamp is required")
    @PastOrPresent(message = "Submission time must be in the past or present")
    private LocalDateTime submittedAt;

    @NotNull(message = "Original score is required")
    @PositiveOrZero(message = "Original score cannot be negative")
    private Double originalScore;
}
