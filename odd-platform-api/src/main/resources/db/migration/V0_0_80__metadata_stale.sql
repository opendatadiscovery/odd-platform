ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITHOUT TIME ZONE;

UPDATE data_entity
SET status_updated_at = deleted_at
WHERE deleted_at IS NOT NULL;

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS platform_created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC'));

UPDATE data_entity
SET platform_created_at = created_at
WHERE manually_created = true;

UPDATE data_entity
SET created_at = NULL
WHERE manually_created = true;

ALTER TABLE data_entity
    RENAME COLUMN created_at TO source_created_at;

UPDATE data_entity
SET updated_at = NULL
WHERE manually_created = true;

ALTER TABLE data_entity
    RENAME COLUMN updated_at TO source_updated_at;

ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS last_ingested_at TIMESTAMP WITHOUT TIME ZONE;

UPDATE data_entity
SET last_ingested_at = (NOW() AT TIME ZONE ('UTC'))
WHERE manually_created IS FALSE;

ALTER TABLE data_entity
    DROP COLUMN IF EXISTS deleted_at;