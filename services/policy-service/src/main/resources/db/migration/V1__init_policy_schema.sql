CREATE TYPE penalty_type AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE policy_schema.policies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    penalty_type penalty_type NOT NULL,
    penalty_value DOUBLE PRECISION NOT NULL,
    grace_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_penalty DOUBLE PRECISION,
    reject_after_days INTEGER,
    active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_schema.policy_versions (
    id VARCHAR(36) PRIMARY KEY,
    policy_id VARCHAR(36) NOT NULL REFERENCES policy_schema.policies(id),
    version_no INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    penalty_type penalty_type NOT NULL,
    penalty_value DOUBLE PRECISION NOT NULL,
    grace_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_penalty DOUBLE PRECISION,
    reject_after_days INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_policy_version UNIQUE (policy_id, version_no)
);

CREATE INDEX idx_policies_active ON policy_schema.policies(active);
CREATE INDEX idx_policy_versions_policy_id ON policy_schema.policy_versions(policy_id);
