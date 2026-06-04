package com.lspe.policy.dto.request;

import com.lspe.common.enums.PenaltyType;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePolicyRequest {

    private String name;

    private String description;

    private PenaltyType penaltyType;

    @Positive
    private Double penaltyValue;

    @PositiveOrZero
    private Double graceHours;

    @Positive
    private Double maxPenalty;

    @Positive
    private Integer rejectAfterDays;

    private String createdBy;
}
