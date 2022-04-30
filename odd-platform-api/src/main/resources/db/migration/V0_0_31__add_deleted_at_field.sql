ALTER TABLE namespace
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE data_source
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE collector
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

UPDATE namespace
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND is_deleted = true;

UPDATE data_source
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND is_deleted = true;

UPDATE collector
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND is_deleted = true;

CREATE UNIQUE INDEX IF NOT EXISTS namespace_unique ON namespace (name) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS data_source_name_unique ON data_source (name) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS data_source_oddrn_unique ON data_source (oddrn) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS collector_name_unique ON collector (name) WHERE deleted_at IS NULL;

ALTER TABLE collector
    DROP CONSTRAINT IF EXISTS collector_name_key;