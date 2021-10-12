ALTER TABLE search_entrypoint
    ADD COLUMN IF NOT EXISTS namespace_vector   tsvector,
    ADD COLUMN IF NOT EXISTS data_source_vector tsvector,
    ADD COLUMN IF NOT EXISTS owner_vector       tsvector;

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
            coalesce(owner_vector, ''))
        stored;

CREATE INDEX search_entrypoint_search_vector_gin_idx ON search_entrypoint USING gin (search_vector);

CREATE AGGREGATE tsvector_agg(tsvector) (
    STYPE = pg_catalog.tsvector,
    SFUNC = pg_catalog.tsvector_concat,
    INITCOND = ''
    );
