SET search_path TO assignment_schema;

CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_code VARCHAR(100) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_policies (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL REFERENCES assignments(id),
    policy_version_id VARCHAR(36) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_course_code 
    ON assignments(course_code);
CREATE INDEX idx_assignment_policies_assignment_id 
    ON assignment_policies(assignment_id);
CREATE INDEX idx_assignment_policies_active 
    ON assignment_policies(active);
