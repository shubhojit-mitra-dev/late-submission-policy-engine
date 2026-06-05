CREATE TYPE submission_schema.submission_status 
    AS ENUM ('ACCEPTED', 'LATE_ACCEPTED', 'REJECTED');

CREATE TABLE submission_schema.submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    student_identifier VARCHAR(255) NOT NULL,
    submission_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE submission_schema.results (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL 
        REFERENCES submission_schema.submissions(id),
    policy_version_id VARCHAR(36) NOT NULL,
    raw_score DOUBLE PRECISION NOT NULL,
    penalty_applied DOUBLE PRECISION NOT NULL DEFAULT 0,
    lateness_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    effective_lateness_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    final_score DOUBLE PRECISION NOT NULL,
    status submission_schema.submission_status NOT NULL,
    evaluated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_assignment_id 
    ON submission_schema.submissions(assignment_id);
CREATE INDEX idx_submissions_student 
    ON submission_schema.submissions(student_identifier);
CREATE INDEX idx_results_submission_id 
    ON submission_schema.results(submission_id);
CREATE INDEX idx_results_status 
    ON submission_schema.results(status);
