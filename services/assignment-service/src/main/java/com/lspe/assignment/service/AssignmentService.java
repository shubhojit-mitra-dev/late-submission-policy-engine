package com.lspe.assignment.service;

import com.lspe.assignment.client.PolicyServiceClient;
import com.lspe.assignment.dto.request.AssignPolicyRequest;
import com.lspe.assignment.dto.request.CreateAssignmentRequest;
import com.lspe.assignment.dto.response.AssignmentPolicyResponse;
import com.lspe.assignment.dto.response.AssignmentResponse;
import com.lspe.assignment.entity.Assignment;
import com.lspe.assignment.entity.AssignmentPolicy;
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

    @Transactional(readOnly = true)
    public java.util.List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(assignment -> {
                    AssignmentPolicyResponse policyResponse = assignmentPolicyRepository
                            .findByAssignmentIdAndActiveTrue(assignment.getId())
                            .map(assignmentMapper::toPolicyResponse)
                            .orElse(null);
                    return assignmentMapper.toResponseWithPolicy(assignment, policyResponse);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new com.lspe.common.exception.ResourceNotFoundException("Assignment not found with id: " + id));
        
        AssignmentPolicyResponse policyResponse = assignmentPolicyRepository
                .findByAssignmentIdAndActiveTrue(assignment.getId())
                .map(assignmentMapper::toPolicyResponse)
                .orElse(null);
                
        return assignmentMapper.toResponseWithPolicy(assignment, policyResponse);
    }

    @Transactional
    public AssignmentResponse updateAssignment(String id, CreateAssignmentRequest request) {
        Assignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new com.lspe.common.exception.ResourceNotFoundException("Assignment not found with id: " + id));
        
        existing.setTitle(request.title());
        existing.setDescription(request.description());
        existing.setCourseCode(request.courseCode());
        existing.setDueDate(request.dueDate());
        existing.setCreatedBy(request.createdBy());
        
        Assignment savedAssignment = assignmentRepository.save(existing);
        
        AssignmentPolicyResponse policyResponse = assignmentPolicyRepository
                .findByAssignmentIdAndActiveTrue(savedAssignment.getId())
                .map(assignmentMapper::toPolicyResponse)
                .orElse(null);
                
        return assignmentMapper.toResponseWithPolicy(savedAssignment, policyResponse);
    }

    @Transactional
    public void deleteAssignment(String id) {
        Assignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new com.lspe.common.exception.ResourceNotFoundException("Assignment not found with id: " + id));
        
        assignmentPolicyRepository.findByAssignmentId(id)
                .forEach(assignmentPolicyRepository::delete);
                
        assignmentRepository.delete(existing);
    }

    @Transactional
    public AssignmentResponse assignPolicy(String assignmentId, AssignPolicyRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new com.lspe.common.exception.ResourceNotFoundException("Assignment not found with id: " + assignmentId));
                
        if (!policyServiceClient.policyVersionExists(request.policyVersionId())) {
            throw new com.lspe.common.exception.ResourceNotFoundException("Policy version not found: " + request.policyVersionId());
        }
        
        assignmentPolicyRepository.deactivateAllByAssignmentId(assignmentId);
        
        AssignmentPolicy newPolicy = AssignmentPolicy.builder()
                .assignment(assignment)
                .policyVersionId(request.policyVersionId())
                .active(true)
                .build();
                
        AssignmentPolicy savedPolicy = assignmentPolicyRepository.save(newPolicy);
        
        AssignmentPolicyResponse policyResponse = assignmentMapper.toPolicyResponse(savedPolicy);
        return assignmentMapper.toResponseWithPolicy(assignment, policyResponse);
    }
}
