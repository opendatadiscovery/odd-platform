ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS subtype VARCHAR(128);

CREATE INDEX IF NOT EXISTS data_entity_subtype_idx ON data_entity (subtype) WHERE subtype IS NOT NULL;
