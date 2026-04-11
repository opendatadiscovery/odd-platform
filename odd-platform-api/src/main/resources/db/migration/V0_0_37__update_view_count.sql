UPDATE data_entity
SET view_count = 0
WHERE view_count IS NULL;

ALTER TABLE data_entity
    ALTER COLUMN view_count SET NOT NULL;