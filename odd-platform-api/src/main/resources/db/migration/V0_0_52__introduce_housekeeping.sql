ALTER TABLE search_facets
    ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE NULL DEFAULT (now() at time zone 'utc');

UPDATE search_facets
SET last_accessed_at = (now() at time zone 'utc');

ALTER TABLE search_facets
    ALTER COLUMN last_accessed_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS shedlock
(
    name       VARCHAR(64)  NOT NULL,
    lock_until TIMESTAMP    NOT NULL,
    locked_at  TIMESTAMP    NOT NULL,
    locked_by  VARCHAR(255) NOT NULL,

    PRIMARY KEY (name)
);