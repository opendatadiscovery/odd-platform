CREATE TABLE IF NOT EXISTS user_owner_mapping
(
    owner_id      bigint UNIQUE,
    oidc_username varchar(512) UNIQUE,

    CONSTRAINT user_owner_mapping_fk_owner FOREIGN KEY (owner_id) REFERENCES owner (id)
)