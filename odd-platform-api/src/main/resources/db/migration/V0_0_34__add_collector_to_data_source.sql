ALTER TABLE data_source
    ADD COLUMN IF NOT EXISTS collector_id BIGINT REFERENCES collector (id);