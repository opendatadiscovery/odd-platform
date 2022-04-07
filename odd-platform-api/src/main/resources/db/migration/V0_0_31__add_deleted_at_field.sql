ALTER TABLE namespace
    ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;

CREATE UNIQUE INDEX namespace_unique ON namespace (name, is_deleted) WHERE deleted_at IS NULL;

UPDATE namespace
SET deleted_at = NOW()
WHERE deleted_at IS NULL