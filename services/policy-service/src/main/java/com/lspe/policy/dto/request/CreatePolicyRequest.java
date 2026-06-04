package com.lspe.policy.dto.request;

import com.lspe.common.enums.PenaltyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreatePolicyRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private PenaltyType penaltyType;

    @NotNull
    @Positive
    private Double penaltyValue;

    @NotNull
    @PositiveOrZero
    private Double graceHours;

    @Positive
    private Double maxPenalty;

    @Positive
    private Integer rejectAfterDays;

    private String createdBy;
}
