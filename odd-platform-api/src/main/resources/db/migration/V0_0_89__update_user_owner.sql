ALTER TABLE IF EXISTS user_owner_mapping
   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;

DROP INDEX IF EXISTS user_owner_mapping_oidc_username_provider_key;

ALTER TABLE IF EXISTS user_owner_mapping
DROP CONSTRAINT IF EXISTS user_owner_mapping_owner_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS unique_deleted_at_per_owner
ON user_owner_mapping (owner_id)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_owner_mapping_oidc_username_provider_deleted_key
ON user_owner_mapping (oidc_username, provider)
WHERE deleted_at IS NULL;


CREATE TABLE IF NOT EXISTS owner_association_request_activity
(
    id                              bigserial PRIMARY KEY,
    owner_association_request_id    bigint,
    event_type                      varchar(64)                 NOT NULL,
    status                          varchar(64)                 NOT NULL,
    created_at                      timestamp without time zone NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),
    status_updated_by               varchar(512),

    CONSTRAINT owner_association_request_activity_fk_owner_association_request FOREIGN KEY (owner_association_request_id) REFERENCES owner_association_request (id)
);
