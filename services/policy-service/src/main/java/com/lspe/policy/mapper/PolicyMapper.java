package com.lspe.policy.mapper;

import com.lspe.policy.dto.request.CreatePolicyRequest;
import com.lspe.policy.dto.request.UpdatePolicyRequest;
import com.lspe.policy.dto.response.PolicyResponse;
import com.lspe.policy.dto.response.PolicyVersionResponse;
import com.lspe.policy.entity.Policy;
import com.lspe.policy.entity.PolicyVersion;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PolicyMapper {

    @Mapping(target = "versions", ignore = true)
    PolicyResponse toResponse(Policy policy);

    Policy toEntity(CreatePolicyRequest request);

    @Mapping(source = "policy.id", target = "policyId")
    PolicyVersionResponse toVersionResponse(PolicyVersion version);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePolicyFromRequest(UpdatePolicyRequest request, @MappingTarget Policy policy);
}
