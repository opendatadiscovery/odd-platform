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


