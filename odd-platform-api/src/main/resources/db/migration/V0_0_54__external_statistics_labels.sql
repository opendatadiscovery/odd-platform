ALTER TABLE label_to_dataset_field
    ADD COLUMN origin VARCHAR(32) NULL;

UPDATE label_to_dataset_field
SET origin = (
    CASE
        WHEN external = true THEN 'EXTERNAL'
        ELSE 'INTERNAL' END
    );

ALTER TABLE label_to_dataset_field
    ALTER COLUMN origin SET NOT NULL,
    ALTER COLUMN origin SET DEFAULT 'INTERNAL',
    DROP COLUMN external;