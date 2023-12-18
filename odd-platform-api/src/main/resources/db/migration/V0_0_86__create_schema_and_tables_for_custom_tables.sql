CREATE TABLE IF NOT EXISTS lookup_tables
(
    id           bigserial PRIMARY KEY,
    name         text                        NOT NULL,
    table_name   text                        NOT NULL,
    description  text,
    namespace_id bigint,
    data_entity_id bigint,
    created_at   timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at   timestamp without time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT lookup_tables_fk_namespace FOREIGN KEY (namespace_id) REFERENCES namespace (id),
    CONSTRAINT lookup_tables_fk_entity FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS lookup_tables_definitions
(
    id                     bigserial PRIMARY KEY,
    lookup_table_id        bigint,
    dataset_field_id       bigint                   NOT NULL,
    column_name            text                     NOT NULL,
    description            text,
    is_primary_key         boolean                  NOT NULL DEFAULT FALSE,
    is_nullable            boolean                  NOT NULL DEFAULT FALSE,
    is_unique              boolean                  NOT NULL DEFAULT FALSE,
    column_type            text                     NOT NULL,
    default_value          text,

    CONSTRAINT lookup_tables_defenitions_table_lookup_id_fkey FOREIGN KEY (lookup_table_id) REFERENCES lookup_tables (id),
    CONSTRAINT lookup_tables_definitions_fk_field FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id)
);

CREATE TABLE IF NOT EXISTS lookup_tables_search_entrypoint
(
    lookup_table_id                       bigint PRIMARY KEY,
    lookup_table_vector                   tsvector,
    lookup_table_defenition_vector        tsvector,
    namespace_vector                      tsvector,
    search_vector                         tsvector GENERATED ALWAYS
                                            AS (coalesce(lookup_table_vector, '')
                                                || coalesce(lookup_table_defenition_vector, '')
                                                || coalesce(namespace_vector, ''))
                                            STORED,

    CONSTRAINT search_entrypoint_lookup_table_id_fkey FOREIGN KEY (lookup_table_id) REFERENCES lookup_tables (id)
);

CREATE INDEX IF NOT EXISTS lookup_tables_search_entrypoint_search_vector_idx
    ON lookup_tables_search_entrypoint USING gin (search_vector);

CREATE SCHEMA IF NOT EXISTS lookup_tables_schema;

SET search_path TO lookup_tables_schema,public;

