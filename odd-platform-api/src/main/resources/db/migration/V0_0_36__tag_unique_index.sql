ALTER TABLE tag
    DROP CONSTRAINT IF EXISTS tag_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS tag_name_unique ON tag (name) WHERE tag.is_deleted IS FALSE;