package com.lspe.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyVersionDetailResponse {
    private String id;
    private String policyId;
    private Integer versionNo;
    private String penaltyType;
    private Double penaltyValue;
    private Double graceHours;
    private Double maxPenalty;
    private Integer rejectAfterDays;
}
