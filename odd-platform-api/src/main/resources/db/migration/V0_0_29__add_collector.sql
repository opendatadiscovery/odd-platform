CREATE TABLE IF NOT EXISTS collector
(
    id           bigserial PRIMARY KEY,
    name         varchar(255) UNIQUE,
    oddrn        varchar(255) UNIQUE,
    description  varchar(255),
    namespace_id bigint,
    token_id     bigint,
    is_deleted   boolean                     NOT NULL DEFAULT FALSE,
    created_at   timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at   timestamp without time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT collector_token_fk FOREIGN KEY (token_id) REFERENCES token (id),
    CONSTRAINT collector_namespace_fk FOREIGN KEY (namespace_id) REFERENCES namespace (id)
);