package com.lspe.submission.mapper;

import com.lspe.submission.dto.request.CreateSubmissionRequest;
import com.lspe.submission.dto.response.ResultResponse;
import com.lspe.submission.dto.response.SubmissionResponse;
import com.lspe.submission.entity.Result;
import com.lspe.submission.entity.Submission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Submission toEntity(CreateSubmissionRequest request);

    @Mapping(target = "result", ignore = true)
    SubmissionResponse toResponse(Submission submission);

    @Mapping(target = "submissionId", source = "submission.id")
    ResultResponse toResultResponse(Result result);
}
