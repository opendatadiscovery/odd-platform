DROP INDEX tag_name_unique;

CREATE UNIQUE INDEX IF NOT EXISTS tag_name_unique ON tag (name) WHERE IS_DELETED = False;