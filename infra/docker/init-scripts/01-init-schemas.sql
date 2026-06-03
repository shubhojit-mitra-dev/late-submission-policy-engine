CREATE SCHEMA IF NOT EXISTS policy_schema;
CREATE SCHEMA IF NOT EXISTS assignment_schema;
CREATE SCHEMA IF NOT EXISTS submission_schema;

GRANT ALL PRIVILEGES ON SCHEMA policy_schema TO lspe_user;
GRANT ALL PRIVILEGES ON SCHEMA assignment_schema TO lspe_user;
GRANT ALL PRIVILEGES ON SCHEMA submission_schema TO lspe_user;
