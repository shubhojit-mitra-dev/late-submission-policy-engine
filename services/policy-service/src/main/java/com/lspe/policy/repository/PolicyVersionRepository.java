package com.lspe.policy.repository;

import com.lspe.policy.entity.PolicyVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyVersionRepository extends JpaRepository<PolicyVersion, String> {
    List<PolicyVersion> findByPolicyId(String policyId);
    Optional<PolicyVersion> findByPolicyIdAndVersionNo(String policyId, Integer versionNo);
    Integer countByPolicyId(String policyId);
}
