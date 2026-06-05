SET search_path TO submission_schema;

CREATE TYPE submission_status 
    AS ENUM ('ACCEPTED', 'LATE_ACCEPTED', 'REJECTED');

CREATE TABLE submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    student_identifier VARCHAR(255) NOT NULL,
    submission_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE results (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL 
        REFERENCES submissions(id),
    policy_version_id VARCHAR(36) NOT NULL,
    raw_score DOUBLE PRECISION NOT NULL,
    penalty_applied DOUBLE PRECISION NOT NULL DEFAULT 0,
    lateness_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    effective_lateness_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    final_score DOUBLE PRECISION NOT NULL,
    status submission_status NOT NULL,
    evaluated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reason VARCHAR(255)
);

CREATE INDEX idx_submissions_assignment_id 
    ON submissions(assignment_id);
CREATE INDEX idx_submissions_student 
    ON submissions(student_identifier);
CREATE INDEX idx_results_submission_id 
    ON results(submission_id);
CREATE INDEX idx_results_status 
    ON results(status);
