ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT 0;