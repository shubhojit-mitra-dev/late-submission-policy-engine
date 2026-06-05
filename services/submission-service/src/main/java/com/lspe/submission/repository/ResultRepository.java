package com.lspe.submission.repository;

import com.lspe.common.enums.SubmissionStatus;
import com.lspe.submission.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, String> {
    Optional<Result> findBySubmissionId(String submissionId);
    List<Result> findByStatus(SubmissionStatus status);
}
