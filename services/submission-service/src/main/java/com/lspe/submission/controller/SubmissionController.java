package com.lspe.submission.controller;

import com.lspe.common.response.ApiResponse;
import com.lspe.submission.dto.request.CreateSubmissionRequest;
import com.lspe.submission.dto.response.SubmissionResponse;
import com.lspe.submission.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(@Valid @RequestBody CreateSubmissionRequest request) {
        SubmissionResponse response = submissionService.submit(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.of(response, "Submission evaluated successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmission(@PathVariable String id) {
        SubmissionResponse response = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.of(response, "Submission retrieved successfully"));
    }
}
