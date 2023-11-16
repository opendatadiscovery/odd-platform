CREATE TABLE IF NOT EXISTS query_example
(
    id           bigserial PRIMARY KEY,
    definition   text                        NOT NULL,
    query        text                        NOT NULL,
    created_at   timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at   timestamp without time zone NOT NULL DEFAULT NOW(),
    is_deleted   boolean                     NOT NULL DEFAULT FALSE,
    deleted_at   TIMESTAMP WITHOUT TIME ZONE
);


CREATE TABLE IF NOT EXISTS data_entity_to_query_example
(
    data_entity_id          bigint,
    query_example_id        bigint,
    deleted_at              TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT data_entity_to_query_example_pk PRIMARY KEY (data_entity_id, query_example_id),

    CONSTRAINT data_entity_to_query_example_query_example_id_fkey FOREIGN KEY (query_example_id) REFERENCES query_example (id),
    CONSTRAINT data_entity_to_query_example_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS query_example_search_entrypoint
(
    query_example_id          bigint PRIMARY KEY,
    query_example_vector      tsvector,
    search_vector             tsvector GENERATED ALWAYS
                                AS (coalesce(query_example_vector, ''))
                                STORED,

    CONSTRAINT search_entrypoint_query_example_id_fkey FOREIGN KEY (query_example_id) REFERENCES query_example (id)
);

CREATE INDEX IF NOT EXISTS query_example_search_entrypoint_search_vector_idx
    ON query_example_search_entrypoint USING gin (search_vector);
