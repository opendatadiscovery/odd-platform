ALTER TABLE title RENAME CONSTRAINT role_pkey TO title_pkey;

DROP INDEX IF EXISTS role_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS title_name_unique ON title (name) WHERE title.is_deleted IS FALSE;

ALTER TABLE role RENAME CONSTRAINT role_pkey1 TO role_pkey;

CREATE UNIQUE INDEX IF NOT EXISTS role_name_unique ON role (name) WHERE role.is_deleted IS FALSE;