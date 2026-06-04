package com.lspe.policy.repository;

import com.lspe.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, String> {
    List<Policy> findByActiveTrue();
    Optional<Policy> findByIdAndActiveTrue(String id);
}
