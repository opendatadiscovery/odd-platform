ALTER TABLE alert
    ADD COLUMN IF NOT EXISTS status_code SMALLINT;

UPDATE alert
SET status_code
        = CASE
              WHEN status = 'OPEN' THEN 1
              WHEN status = 'RESOLVED' THEN 2
        END;

ALTER TABLE alert
    DROP COLUMN status;

ALTER TABLE alert
    RENAME COLUMN status_code TO status;