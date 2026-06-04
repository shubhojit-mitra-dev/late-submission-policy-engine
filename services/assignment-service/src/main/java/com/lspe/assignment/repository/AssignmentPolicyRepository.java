package com.lspe.assignment.repository;

import com.lspe.assignment.entity.AssignmentPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentPolicyRepository extends JpaRepository<AssignmentPolicy, String> {

    Optional<AssignmentPolicy> findByAssignmentIdAndActiveTrue(String assignmentId);

    List<AssignmentPolicy> findByAssignmentId(String assignmentId);

    @Modifying
    @Query("UPDATE AssignmentPolicy ap SET ap.active = false WHERE ap.assignment.id = :assignmentId")
    void deactivateAllByAssignmentId(@Param("assignmentId") String assignmentId);
}
