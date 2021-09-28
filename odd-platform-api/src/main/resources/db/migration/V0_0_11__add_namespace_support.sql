ALTER TABLE data_source
    ADD COLUMN namespace_id BIGINT REFERENCES namespace (id);

ALTER TABLE data_entity
    DROP COLUMN namespace_id;