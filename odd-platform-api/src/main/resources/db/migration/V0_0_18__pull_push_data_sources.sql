ALTER TABLE data_source
    DROP CONSTRAINT data_source_name_key,
    DROP CONSTRAINT data_source_oddrn_key,
    ALTER COLUMN active SET NOT NULL,
    ALTER COLUMN active SET DEFAULT false