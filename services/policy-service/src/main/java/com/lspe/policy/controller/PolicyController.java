package com.lspe.policy.controller;

import com.lspe.common.response.ApiResponse;
import com.lspe.policy.dto.request.CreatePolicyRequest;
import com.lspe.policy.dto.request.UpdatePolicyRequest;
import com.lspe.policy.dto.response.PolicyResponse;
import com.lspe.policy.service.PolicyService;
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
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PolicyResponse>> createPolicy(@RequestBody @Valid CreatePolicyRequest request) {
        PolicyResponse response = policyService.createPolicy(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(response, "Policy created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PolicyResponse>>> getAllPolicies() {
        List<PolicyResponse> response = policyService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.of(response, "Policies retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyResponse>> getPolicyById(@PathVariable String id) {
        PolicyResponse response = policyService.getPolicyById(id);
        return ResponseEntity.ok(ApiResponse.of(response, "Policy retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyResponse>> updatePolicy(
            @PathVariable String id,
            @RequestBody @Valid UpdatePolicyRequest request) {
        PolicyResponse response = policyService.updatePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.of(response, "Policy updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable String id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.of(null, "Policy deleted successfully"));
    }
}
