CREATE TABLE IF NOT EXISTS token
(
    id          bigserial PRIMARY KEY,
    name        varchar(64) NOT NULL,
    description varchar(255),
    value       varchar(40) NOT NULL,
    created_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    created_by  varchar(255) NOT NULL,
    updated_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_by  varchar(255) NOT NULL
);

ALTER TABLE data_source
    ADD token_id bigint,
    ADD CONSTRAINT data_source_fk_token FOREIGN KEY (token_id) REFERENCES token (id);

ALTER TABLE search_entrypoint
    ADD COLUMN IF NOT EXISTS token_vector tsvector;

ALTER TABLE search_entrypoint
    DROP COLUMN search_vector,
    ADD COLUMN search_vector tsvector GENERATED ALWAYS
        AS (coalesce(data_entity_vector, '') ||
            coalesce(tag_vector, '') ||
            coalesce(metadata_vector, '') ||
            coalesce(structure_vector, '') ||
            coalesce(task_run_vector, '') ||
            coalesce(namespace_vector, '') ||
            coalesce(data_source_vector, '') ||
            coalesce(owner_vector, '') ||
            coalesce(token_vector, ''))
        stored;
