package com.lspe.assignment.service;

import com.lspe.assignment.client.PolicyServiceClient;
import com.lspe.assignment.dto.request.CreateAssignmentRequest;
import com.lspe.assignment.dto.response.AssignmentResponse;
import com.lspe.assignment.entity.Assignment;
import com.lspe.assignment.mapper.AssignmentMapper;
import com.lspe.assignment.repository.AssignmentPolicyRepository;
import com.lspe.assignment.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentPolicyRepository assignmentPolicyRepository;
    private final AssignmentMapper assignmentMapper;
    private final PolicyServiceClient policyServiceClient;

    @Transactional
    public AssignmentResponse createAssignment(CreateAssignmentRequest request) {
        log.info("Creating new assignment: {}", request.title());
        
        Assignment assignment = assignmentMapper.toEntity(request);
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        return assignmentMapper.toResponse(savedAssignment);
    }
}
