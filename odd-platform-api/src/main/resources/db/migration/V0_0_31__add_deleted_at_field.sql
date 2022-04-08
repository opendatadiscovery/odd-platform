ALTER TABLE namespace
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE data_source
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;

CREATE UNIQUE INDEX namespace_unique ON namespace (name, is_deleted) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX data_source_name_unique ON data_source (name, is_deleted) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX data_source_oddrn_unique ON data_source (oddrn, is_deleted) WHERE deleted_at IS NULL;

ALTER TABLE collector
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;

CREATE UNIQUE INDEX collector_oddrn_unique ON data_source (name, is_deleted) WHERE deleted_at IS NULL;

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