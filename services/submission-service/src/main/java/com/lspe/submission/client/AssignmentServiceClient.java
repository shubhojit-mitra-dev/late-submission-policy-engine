package com.lspe.submission.client;

import com.lspe.common.response.ApiResponse;
import com.lspe.submission.dto.response.AssignmentDetailResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class AssignmentServiceClient {

    private final RestClient assignmentServiceRestClient;

    public AssignmentServiceClient(@Qualifier("assignmentServiceRestClient") RestClient assignmentServiceRestClient) {
        this.assignmentServiceRestClient = assignmentServiceRestClient;
    }

    public AssignmentDetailResponse getAssignment(String assignmentId) {
        log.debug("Fetching assignment details for id: {}", assignmentId);
        
        ApiResponse<AssignmentDetailResponse> response = assignmentServiceRestClient.get()
                .uri("/api/assignments/{id}", assignmentId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response != null && response.getData() != null) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to fetch assignment details for id: " + assignmentId);
    }
}
