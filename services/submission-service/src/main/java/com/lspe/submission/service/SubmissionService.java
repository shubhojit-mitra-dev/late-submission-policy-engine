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

        // Fetch assignment from assignment-service
        AssignmentDetailResponse assignment = assignmentServiceClient.getAssignment(request.getAssignmentId());
        if (assignment.getActivePolicyMapping() == null || assignment.getActivePolicyMapping().getPolicyVersionId() == null) {
            throw new InvalidPolicyException("No policy assigned to this assignment");
        }

        // Fetch policy version from policy-service
        String policyVersionId = assignment.getActivePolicyMapping().getPolicyVersionId();
        PolicyVersionDetailResponse policyVersion = policyServiceClient.getPolicyVersion(policyVersionId);

        // Calculate lateness in hours
        Duration duration = Duration.between(assignment.getDueDate(), request.getSubmittedAt());
        double hoursLate = Math.max(0, duration.toMinutes() / 60.0);

        // Run evaluation
        EvaluationResult evalResult = evaluationEngine.evaluate(policyVersion, request.getOriginalScore(), hoursLate);

        // Save submission
        Submission submission = submissionMapper.toEntity(request);
        submission = submissionRepository.save(submission);

        // Build and save result
        Result result = Result.builder()
                .submission(submission)
                .policyVersionId(policyVersionId)
                .rawScore(request.getOriginalScore())
                .penaltyApplied(evalResult.penaltyApplied())
                .latenessHours(hoursLate)
                .effectiveLatenessHours(evalResult.effectiveLatenessHours())
                .finalScore(evalResult.finalScore())
                .status(evalResult.status())
                .reason(evalResult.reason())
                .build();
        resultRepository.save(result);

        // Map to response
        SubmissionResponse response = submissionMapper.toResponse(submission);
        ResultResponse resultResponse = submissionMapper.toResultResponse(result);
        response.setResult(resultResponse);

        return response;
    }

    public SubmissionResponse getSubmissionById(String id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new com.lspe.common.exception.ResourceNotFoundException("Submission not found"));
        return mapToResponse(submission);
    }

    public java.util.List<SubmissionResponse> getSubmissionsByAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public java.util.List<SubmissionResponse> getSubmissionsByStudent(String studentIdentifier) {
        return submissionRepository.findByStudentIdentifier(studentIdentifier).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        SubmissionResponse response = submissionMapper.toResponse(submission);
        resultRepository.findBySubmissionId(submission.getId()).ifPresent(result -> {
            ResultResponse resultResponse = submissionMapper.toResultResponse(result);
            response.setResult(resultResponse);
        });
        return response;
    }
}
