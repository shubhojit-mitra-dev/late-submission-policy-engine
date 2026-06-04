package com.lspe.assignment.mapper;

import com.lspe.assignment.dto.request.CreateAssignmentRequest;
import com.lspe.assignment.dto.response.AssignmentPolicyResponse;
import com.lspe.assignment.dto.response.AssignmentResponse;
import com.lspe.assignment.entity.Assignment;
import com.lspe.assignment.entity.AssignmentPolicy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Assignment toEntity(CreateAssignmentRequest request);

    @Mapping(target = "activePolicyMapping", ignore = true)
    AssignmentResponse toResponse(Assignment assignment);

    @Mapping(target = "assignmentId", source = "assignment.id")
    AssignmentPolicyResponse toPolicyResponse(AssignmentPolicy assignmentPolicy);
}
