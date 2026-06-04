package com.lspe.assignment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${services.policy-service.base-url}")
    private String policyServiceBaseUrl;

    @Bean
    public RestClient policyServiceRestClient() {
        return RestClient.builder()
                .baseUrl(policyServiceBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
