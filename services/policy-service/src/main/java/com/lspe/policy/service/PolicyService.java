package com.lspe.policy.service;

import com.lspe.common.exception.PolicyNotFoundException;
import com.lspe.policy.domain.PolicyEvaluationService;
import com.lspe.policy.dto.request.CreatePolicyRequest;
import com.lspe.policy.dto.response.PolicyResponse;
import com.lspe.policy.dto.response.PolicyVersionResponse;
import com.lspe.policy.entity.Policy;
import com.lspe.policy.entity.PolicyVersion;
import com.lspe.policy.mapper.PolicyMapper;
import com.lspe.policy.repository.PolicyRepository;
import com.lspe.policy.repository.PolicyVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final PolicyVersionRepository policyVersionRepository;
    private final PolicyMapper policyMapper;
    private final PolicyEvaluationService policyEvaluationService;

    @Transactional
    public PolicyResponse createPolicy(CreatePolicyRequest request) {
        log.info("Creating new policy: {}", request.getName());

        // Map request to entity via mapper
        Policy policy = policyMapper.toEntity(request);
        
        // Set id to UUID manually as requested
        policy.setId(UUID.randomUUID().toString());

        // Save policy
        Policy savedPolicy = policyRepository.save(policy);

        // Auto-create first version (immutable snapshot)
        PolicyVersion version = new PolicyVersion();
        version.setPolicy(savedPolicy);
        version.setVersionNo(1);
        version.setName(savedPolicy.getName());
        version.setDescription(savedPolicy.getDescription());
        version.setPenaltyType(savedPolicy.getPenaltyType());
        version.setPenaltyValue(savedPolicy.getPenaltyValue());
        version.setGraceHours(savedPolicy.getGraceHours());
        version.setMaxPenalty(savedPolicy.getMaxPenalty());
        version.setRejectAfterDays(savedPolicy.getRejectAfterDays());

        // Save the version
        policyVersionRepository.save(version);

        // Return mapped response
        return policyMapper.toResponse(savedPolicy);
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getAllPolicies() {
        return policyRepository.findByActiveTrue()
                .stream()
                .map(policyMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PolicyResponse getPolicyById(String id) {
        return policyRepository.findByIdAndActiveTrue(id)
                .map(policyMapper::toResponse)
                .orElseThrow(() -> new PolicyNotFoundException(id));
    }
}
