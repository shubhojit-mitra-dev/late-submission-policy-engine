package com.lspe.submission.service;

import com.lspe.common.exception.InvalidPolicyException;
import com.lspe.submission.client.AssignmentServiceClient;
import com.lspe.submission.client.PolicyServiceClient;
import com.lspe.submission.domain.EvaluationEngine;
import com.lspe.submission.domain.EvaluationEngine.EvaluationResult;
import com.lspe.submission.dto.request.CreateSubmissionRequest;
import com.lspe.submission.dto.response.AssignmentDetailResponse;
import com.lspe.submission.dto.response.PolicyVersionDetailResponse;
import com.lspe.submission.dto.response.ResultResponse;
import com.lspe.submission.dto.response.SubmissionResponse;
import com.lspe.submission.entity.Result;
import com.lspe.submission.entity.Submission;
import com.lspe.submission.mapper.SubmissionMapper;
import com.lspe.submission.repository.ResultRepository;
import com.lspe.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final SubmissionMapper submissionMapper;
    private final PolicyServiceClient policyServiceClient;
    private final AssignmentServiceClient assignmentServiceClient;
    private final EvaluationEngine evaluationEngine;

    @Transactional
    public SubmissionResponse submit(CreateSubmissionRequest request) {
        log.info("Processing new submission for assignment: {} by student: {}", request.getAssignmentId(), request.getStudentIdentifier());

        // Step 1 — Fetch assignment from assignment-service
        AssignmentDetailResponse assignment = assignmentServiceClient.getAssignment(request.getAssignmentId());
        if (assignment.getActivePolicyMapping() == null || assignment.getActivePolicyMapping().getPolicyVersionId() == null) {
            throw new InvalidPolicyException("No policy assigned to this assignment");
        }

        // Step 2 — Fetch policy version from policy-service
        String policyVersionId = assignment.getActivePolicyMapping().getPolicyVersionId();
        PolicyVersionDetailResponse policyVersion = policyServiceClient.getPolicyVersion(policyVersionId);

        // Step 3 — Check for duplicate submission
        if (submissionRepository.findByAssignmentIdAndStudentIdentifier(request.getAssignmentId(), request.getStudentIdentifier()).isPresent()) {
            throw new IllegalArgumentException("Duplicate submission for this assignment");
        }

        // Step 4 — Calculate lateness in hours
        double hoursLate = 0.0;
        if (request.getSubmittedAt().isAfter(assignment.getDueDate())) {
            Duration duration = Duration.between(assignment.getDueDate(), request.getSubmittedAt());
            hoursLate = duration.toMinutes() / 60.0;
        }

        // Step 5 — Evaluate using domain engine
        EvaluationResult evalResult = evaluationEngine.evaluate(policyVersion, request.getOriginalScore(), hoursLate);

        // Step 6 — Save to database
        Submission submission = submissionMapper.toEntity(request);
        submission = submissionRepository.save(submission);

        Result result = Result.builder()
                .submission(submission)
                .policyVersionId(policyVersionId)
                .rawScore(request.getOriginalScore())
                .penaltyApplied(evalResult.penaltyApplied())
                .latenessHours(hoursLate)
                .effectiveLatenessHours(evalResult.effectiveLatenessHours())
                .finalScore(evalResult.finalScore())
                .status(evalResult.status())
                .build();
        result = resultRepository.save(result);

        // Step 7 — Map to response and inject reason
        SubmissionResponse response = submissionMapper.toResponse(submission);
        ResultResponse resultResponse = submissionMapper.toResultResponse(result);
        resultResponse.setReason(evalResult.reason());
        response.setResult(resultResponse);

        return response;
    }
}
