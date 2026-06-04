package com.lspe.policy.dto.response;

import com.lspe.common.enums.PenaltyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyResponse {

    private String id;
    private String name;
    private String description;
    private PenaltyType penaltyType;
    private Double penaltyValue;
    private Double graceHours;
    private Double maxPenalty;
    private Integer rejectAfterDays;
    private Boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<PolicyVersionResponse> versions;
}
