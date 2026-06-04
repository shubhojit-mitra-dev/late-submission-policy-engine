package com.lspe.assignment.client;

import com.lspe.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class PolicyServiceClient {

    private final RestClient restClient;

    public boolean policyVersionExists(String policyVersionId) {
        try {
            restClient.get()
                    .uri("/api/policies/versions/{id}", policyVersionId)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 404) {
                return false;
            }
            log.error("Error communicating with policy-service: {}", e.getMessage(), e);
            throw new ResourceNotFoundException("Policy service unavailable");
        } catch (Exception e) {
            log.error("Error communicating with policy-service: {}", e.getMessage(), e);
            throw new ResourceNotFoundException("Policy service unavailable");
        }
    }
}
