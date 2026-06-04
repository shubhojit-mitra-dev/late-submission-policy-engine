package com.lspe.assignment.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateAssignmentRequest(
        @NotBlank(message = "Title is required")
        String title,
        
        String description,
        
        @NotBlank(message = "Course code is required")
        String courseCode,
        
        @NotNull(message = "Due date is required")
        @Future(message = "Due date must be in the future")
        LocalDateTime dueDate,
        
        String createdBy
) {
}
