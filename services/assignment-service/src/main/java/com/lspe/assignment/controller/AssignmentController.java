package com.lspe.assignment.controller;

import com.lspe.assignment.dto.request.AssignPolicyRequest;
import com.lspe.assignment.dto.request.CreateAssignmentRequest;
import com.lspe.assignment.dto.response.AssignmentResponse;
import com.lspe.assignment.service.AssignmentService;
import com.lspe.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @RequestBody @Valid CreateAssignmentRequest request) {
        AssignmentResponse response = assignmentService.createAssignment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(response, "Assignment created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments() {
        List<AssignmentResponse> response = assignmentService.getAllAssignments();
        return ResponseEntity.ok(ApiResponse.of(response, "Assignments retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable String id) {
        AssignmentResponse response = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.of(response, "Assignment retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable String id,
            @RequestBody @Valid CreateAssignmentRequest request) {
        AssignmentResponse response = assignmentService.updateAssignment(id, request);
        return ResponseEntity.ok(ApiResponse.of(response, "Assignment updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable String id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.of(null, "Assignment deleted successfully"));
    }

    @PostMapping("/{id}/policy")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignPolicy(
            @PathVariable String id,
            @RequestBody @Valid AssignPolicyRequest request) {
        AssignmentResponse response = assignmentService.assignPolicy(id, request);
        return ResponseEntity.ok(ApiResponse.of(response, "Policy assigned successfully"));
    }
}
