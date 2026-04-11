ALTER TABLE IF EXISTS user_owner_mapping
    ADD COLUMN IF NOT EXISTS provider VARCHAR(255);

ALTER TABLE IF EXISTS user_owner_mapping
    DROP CONSTRAINT IF EXISTS user_owner_mapping_oidc_username_key;

CREATE UNIQUE INDEX IF NOT EXISTS user_owner_mapping_oidc_username_provider_key
    ON user_owner_mapping (oidc_username, provider);

ALTER TABLE IF EXISTS owner_association_request
    ADD COLUMN IF NOT EXISTS provider VARCHAR(255);

DROP INDEX IF EXISTS username_owner_id_status_unique;

CREATE UNIQUE INDEX IF NOT EXISTS username_provider_owner_id_status_unique
    ON owner_association_request (username, provider, owner_id, status)
    WHERE owner_association_request.status IN ('PENDING', 'APPROVED');

CREATE TABLE IF NOT EXISTS policy
(
    id         bigserial PRIMARY KEY,
    name       varchar(255)                NOT NULL,
    policy     text,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS policy_name_unique ON policy (name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS role
(
    id         bigserial PRIMARY KEY,
    name       varchar(255)                NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS role_name_unique ON role (name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS role_to_policy
(
    role_id   bigint,
    policy_id bigint,

    CONSTRAINT role_to_policy_pk PRIMARY KEY (role_id, policy_id),

    CONSTRAINT role_to_policy_role_id_fkey FOREIGN KEY (role_id) REFERENCES role (id),
    CONSTRAINT role_to_policy_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES policy (id)
);

CREATE TABLE IF NOT EXISTS owner_to_role
(
    owner_id bigint,
    role_id  bigint,

    CONSTRAINT owner_to_role_pk PRIMARY KEY (owner_id, role_id),

    CONSTRAINT owner_to_role_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES owner (id),
    CONSTRAINT owner_to_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES role (id)
);