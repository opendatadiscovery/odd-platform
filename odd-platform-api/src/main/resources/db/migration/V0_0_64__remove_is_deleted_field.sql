UPDATE collector
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE collector
    DROP COLUMN IF EXISTS is_deleted;

UPDATE data_entity
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE data_entity
    DROP COLUMN IF EXISTS is_deleted;

UPDATE data_source
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE data_source
    DROP COLUMN IF EXISTS is_deleted;

UPDATE enum_value
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE enum_value
    DROP COLUMN IF EXISTS is_deleted;

UPDATE label
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE label
    DROP COLUMN IF EXISTS is_deleted;

ALTER TABLE metadata_field
    ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone;

UPDATE metadata_field
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE metadata_field
    DROP COLUMN IF EXISTS is_deleted;

UPDATE namespace
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE namespace
    DROP COLUMN IF EXISTS is_deleted;

ALTER TABLE owner
    ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone;

UPDATE owner
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

DROP INDEX IF EXISTS owner_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS owner_name_unique ON owner (name) WHERE owner.deleted_at IS NULL;

ALTER TABLE owner
    DROP COLUMN IF EXISTS is_deleted;

UPDATE policy
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE policy
    DROP COLUMN IF EXISTS is_deleted;

UPDATE role
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

DROP INDEX IF EXISTS role_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS role_name_unique ON role (name) WHERE role.deleted_at IS NULL;

ALTER TABLE role
    DROP COLUMN IF EXISTS is_deleted;

ALTER TABLE tag
    ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone;

UPDATE tag
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

DROP INDEX IF EXISTS tag_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS tag_name_unique ON tag (name) WHERE tag.deleted_at IS NULL;

ALTER TABLE tag
    DROP COLUMN IF EXISTS is_deleted;

UPDATE term
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

ALTER TABLE term
    DROP COLUMN IF EXISTS is_deleted;

ALTER TABLE title
    ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone;

UPDATE title
SET deleted_at = now()
WHERE is_deleted IS TRUE
  AND deleted_at IS NULL;

DROP INDEX IF EXISTS title_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS title_name_unique ON title (name) WHERE title.deleted_at IS NULL;

ALTER TABLE title
    DROP COLUMN IF EXISTS is_deleted;