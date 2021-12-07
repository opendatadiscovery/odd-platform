ALTER TABLE data_source
    DROP CONSTRAINT data_source_name_key,
    DROP CONSTRAINT data_source_oddrn_key,
    ALTER COLUMN active SET NOT NULL,
    ALTER COLUMN active SET DEFAULT false;

UPDATE data_source
SET connection_url = NULL
WHERE active = false;

UPDATE data_source
SET oddrn = '//oddplatform/datasources/' || data_source.id
WHERE active = true;