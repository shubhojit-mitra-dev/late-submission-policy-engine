package com.lspe.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {
    private String id;
    private String assignmentId;
    private String studentIdentifier;
    private String submissionUrl;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    
    // Always populated since evaluation is synchronous
    private ResultResponse result;
}
