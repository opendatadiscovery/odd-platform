ALTER TABLE namespace
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE data_source
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE collector
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

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

CREATE UNIQUE INDEX namespace_unique ON namespace (name) WHERE is_deleted = false;

CREATE UNIQUE INDEX data_source_name_unique ON data_source (name) WHERE is_deleted = false;

CREATE UNIQUE INDEX data_source_oddrn_unique ON data_source (oddrn) WHERE is_deleted = false;

CREATE UNIQUE INDEX collector_name_unique ON collector (name) WHERE is_deleted = false;

ALTER TABLE collector
    DROP CONSTRAINT collector_name_key;