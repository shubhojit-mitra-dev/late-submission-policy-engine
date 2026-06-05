package com.lspe.submission.client;

import com.lspe.common.response.ApiResponse;
import com.lspe.submission.dto.response.PolicyVersionDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class PolicyServiceClient {

    private final RestClient policyServiceRestClient;

    public PolicyVersionDetailResponse getPolicyVersion(String policyVersionId) {
        log.debug("Fetching policy version details for id: {}", policyVersionId);
        
        ApiResponse<PolicyVersionDetailResponse> response = policyServiceRestClient.get()
                .uri("/api/policies/versions/{id}", policyVersionId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response != null && response.getData() != null) {
            return response.getData();
        }
        
        throw new RuntimeException("Failed to fetch policy version details for id: " + policyVersionId);
    }
}
