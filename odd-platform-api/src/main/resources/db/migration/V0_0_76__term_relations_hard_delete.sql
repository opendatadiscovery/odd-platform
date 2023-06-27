DELETE
FROM data_entity_to_term
WHERE deleted_at IS NOT NULL;

ALTER TABLE data_entity_to_term
    DROP COLUMN IF EXISTS deleted_at;

DELETE
FROM tag_to_term
WHERE deleted_at IS NOT NULL;

ALTER TABLE tag_to_term
    DROP COLUMN IF EXISTS deleted_at;

DELETE
FROM term_ownership
WHERE deleted_at IS NOT NULL;

DROP INDEX IF EXISTS term_id_owner_id_unique;

ALTER TABLE term_ownership
    DROP COLUMN IF EXISTS deleted_at;

CREATE UNIQUE INDEX IF NOT EXISTS term_id_owner_id_unique ON term_ownership (term_id, owner_id);