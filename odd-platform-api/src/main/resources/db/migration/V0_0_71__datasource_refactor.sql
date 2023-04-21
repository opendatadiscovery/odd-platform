WITH t AS (SELECT data_entity.id AS data_entity_id,
                  data_source.name,
                  data_source.oddrn
           FROM data_source
                    JOIN data_entity
                         ON (data_entity.data_source_id = data_source.id)
           WHERE data_source.connection_url IS NOT NULL)
INSERT
INTO search_entrypoint (data_entity_id, data_source_vector)
SELECT t.data_entity_id,
       setweight(to_tsvector(coalesce(t.name, '')), 'B') ||
       setweight(to_tsvector(coalesce(t.oddrn, '')), 'D')
FROM t
ON CONFLICT (data_entity_id) DO UPDATE SET data_source_vector = excluded.data_source_vector;

ALTER TABLE data_source
    DROP COLUMN IF EXISTS active;

ALTER TABLE data_source
    DROP COLUMN IF EXISTS connection_url;

ALTER TABLE data_source
    DROP COLUMN IF EXISTS pulling_interval;