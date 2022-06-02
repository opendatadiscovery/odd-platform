ALTER TABLE enum_value
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

UPDATE enum_value
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND is_deleted = true;

ALTER TABLE enum_value
DROP CONSTRAINT IF EXISTS enum_value_name_dataset_field_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS enum_value_unique ON enum_value (name, dataset_field_id) WHERE deleted_at IS NULL;