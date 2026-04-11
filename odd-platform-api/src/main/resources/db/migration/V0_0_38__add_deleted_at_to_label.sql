ALTER TABLE label
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

ALTER TABLE label
    DROP CONSTRAINT IF EXISTS label_name_key;

UPDATE label
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND is_deleted = true;

CREATE UNIQUE INDEX IF NOT EXISTS label_unique ON label (name) WHERE deleted_at IS NULL;