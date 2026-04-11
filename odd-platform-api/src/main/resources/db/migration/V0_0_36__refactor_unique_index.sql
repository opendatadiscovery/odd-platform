ALTER TABLE tag
    DROP CONSTRAINT IF EXISTS tag_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS tag_name_unique ON tag (name) WHERE tag.is_deleted IS FALSE;

ALTER TABLE owner
    DROP CONSTRAINT IF EXISTS owner_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS owner_name_unique ON owner (name) WHERE owner.is_deleted IS FALSE;

ALTER TABLE role
    DROP CONSTRAINT IF EXISTS role_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS role_name_unique ON role (name) WHERE role.is_deleted IS FALSE;