package com.lspe.policy.service;

import com.lspe.common.exception.PolicyNotFoundException;
import com.lspe.common.exception.ResourceNotFoundException;
import com.lspe.policy.domain.PolicyEvaluationService;
import com.lspe.policy.dto.request.CreatePolicyRequest;
import com.lspe.policy.dto.request.UpdatePolicyRequest;
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

        Policy policy = policyMapper.toEntity(request);
        policy.setId(UUID.randomUUID().toString());
        Policy savedPolicy = policyRepository.save(policy);

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

        policyVersionRepository.save(version);
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

    @Transactional
    public PolicyResponse updatePolicy(String id, UpdatePolicyRequest request) {
        log.info("Updating policy with id: {}", id);
        
        Policy existingPolicy = policyRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new PolicyNotFoundException(id));
        
        policyMapper.updatePolicyFromRequest(request, existingPolicy);
        Policy savedPolicy = policyRepository.save(existingPolicy);
        
        Integer currentVersionCount = policyVersionRepository.countByPolicyId(id);
        int nextVersionNo = (currentVersionCount == null ? 0 : currentVersionCount) + 1;
        
        PolicyVersion newVersion = new PolicyVersion();
        newVersion.setPolicy(savedPolicy);
        newVersion.setVersionNo(nextVersionNo);
        newVersion.setName(savedPolicy.getName());
        newVersion.setDescription(savedPolicy.getDescription());
        newVersion.setPenaltyType(savedPolicy.getPenaltyType());
        newVersion.setPenaltyValue(savedPolicy.getPenaltyValue());
        newVersion.setGraceHours(savedPolicy.getGraceHours());
        newVersion.setMaxPenalty(savedPolicy.getMaxPenalty());
        newVersion.setRejectAfterDays(savedPolicy.getRejectAfterDays());
        
        policyVersionRepository.save(newVersion);
        
        return policyMapper.toResponse(savedPolicy);
    }

    @Transactional
    public void deletePolicy(String id) {
        Policy existingPolicy = policyRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new PolicyNotFoundException(id));
        
        existingPolicy.setActive(false);
        policyRepository.save(existingPolicy);
        
        log.info("Policy {} soft deleted", id);
    }

    @Transactional(readOnly = true)
    public List<PolicyVersionResponse> getPolicyVersions(String policyId) {
        policyRepository.findByIdAndActiveTrue(policyId)
                .orElseThrow(() -> new PolicyNotFoundException(policyId));
        
        return policyVersionRepository.findByPolicyId(policyId)
                .stream()
                .map(policyMapper::toVersionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PolicyVersionResponse getPolicyVersion(String policyId, Integer versionNo) {
        return policyVersionRepository.findByPolicyIdAndVersionNo(policyId, versionNo)
                .map(policyMapper::toVersionResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Policy version not found"));
    }
}
