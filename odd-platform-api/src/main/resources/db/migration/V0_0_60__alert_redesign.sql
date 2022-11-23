ALTER TABLE alert
    ADD COLUMN IF NOT EXISTS status_code SMALLINT,
    ADD COLUMN IF NOT EXISTS type_code   SMALLINT,
    ADD COLUMN IF NOT EXISTS created_ats TIMESTAMP WITHOUT TIME ZONE[];

ALTER TABLE alert
    RENAME COLUMN created_at TO last_created_at;

ALTER TABLE alert
    ALTER COLUMN last_created_at SET NOT NULL;

UPDATE alert
SET status_code
        = CASE
              WHEN status = 'OPEN' THEN 1
              WHEN status = 'RESOLVED' THEN 2
        END;

UPDATE alert
SET type_code
        = CASE
              WHEN type = 'BACKWARDS_INCOMPATIBLE_SCHEMA' THEN 1
              WHEN type = 'FAILED_DQ_TEST' THEN 2
              WHEN type = 'FAILED_JOB' THEN 3
              WHEN type = 'DISTRIBUTION_ANOMALY' THEN 4
        END;

UPDATE alert
SET created_ats = ARRAY [last_created_at];

ALTER TABLE alert
    DROP COLUMN status,
    DROP COLUMN type;

ALTER TABLE alert
    RENAME COLUMN status_code TO status;

ALTER TABLE alert
    RENAME COLUMN type_code TO type;