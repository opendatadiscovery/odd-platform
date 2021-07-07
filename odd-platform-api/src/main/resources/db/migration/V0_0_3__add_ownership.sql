CREATE TABLE IF NOT EXISTS role
(
    id         bigserial PRIMARY KEY,
    name       varchar(128) UNIQUE,
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ownership
(
    id             bigserial PRIMARY KEY,
    data_entity_id bigint,
    owner_id       bigint,
    role_id        bigint,

    UNIQUE (data_entity_id, owner_id),

    CONSTRAINT ownership_fk_data_entity FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT ownership_fk_owner FOREIGN KEY (owner_id) REFERENCES owner (id),
    CONSTRAINT ownership_fk_role FOREIGN KEY (role_id) REFERENCES role (id)
);

ALTER TABLE data_entity
    DROP COLUMN IF EXISTS owner_id;