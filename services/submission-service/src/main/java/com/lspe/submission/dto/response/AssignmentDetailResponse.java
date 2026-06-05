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
public class AssignmentDetailResponse {
    private String id;
    private String title;
    private LocalDateTime dueDate;
    private ActivePolicyMappingResponse activePolicyMapping;
}
