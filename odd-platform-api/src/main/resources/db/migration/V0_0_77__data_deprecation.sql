ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS status SMALLINT DEFAULT 1;

UPDATE data_entity
SET status = 1
WHERE deleted_at IS NULL;

UPDATE data_entity
SET status = 5
WHERE deleted_at IS NOT NULL;

ALTER TABLE data_entity
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS status_switch_time TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE data_entity_filled
    ADD COLUMN IF NOT EXISTS status_filled BOOLEAN NOT NULL DEFAULT FALSE;