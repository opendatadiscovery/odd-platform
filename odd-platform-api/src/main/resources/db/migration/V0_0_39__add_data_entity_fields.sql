ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS manually_created BOOLEAN DEFAULT FALSE;

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS namespace_id BIGINT REFERENCES namespace (id);

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

UPDATE data_entity
SET manually_created = false;

UPDATE data_entity
SET is_deleted = false;