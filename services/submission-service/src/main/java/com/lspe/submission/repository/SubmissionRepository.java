package com.lspe.submission.repository;

import com.lspe.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByAssignmentId(String assignmentId);
    List<Submission> findByStudentIdentifier(String studentIdentifier);
    Optional<Submission> findByAssignmentIdAndStudentIdentifier(String assignmentId, String studentIdentifier);
}
