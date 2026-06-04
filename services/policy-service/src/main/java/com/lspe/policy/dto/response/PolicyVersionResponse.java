package com.lspe.policy.dto.response;

import com.lspe.common.enums.PenaltyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyVersionResponse {
    
    private String id;
    private String policyId;
    private Integer versionNo;
    private String name;
    private String description;
    private PenaltyType penaltyType;
    private Double penaltyValue;
    private Double graceHours;
    private Double maxPenalty;
    private Integer rejectAfterDays;
    private LocalDateTime createdAt;
    
}
