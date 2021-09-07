CREATE TABLE IF NOT EXISTS dataset_structure
(
    dataset_version_id bigint NOT NULL,
    dataset_field_id   bigint NOT NULL,

    CONSTRAINT dataset_structure_pk
        PRIMARY KEY (dataset_version_id, dataset_field_id),

    CONSTRAINT dataset_structure_dataset_version_id_fkey
        FOREIGN KEY (dataset_version_id)
            REFERENCES dataset_version (id),

    CONSTRAINT dataset_structure_dataset_field_id_fkey
        FOREIGN KEY (dataset_field_id)
            REFERENCES dataset_field (id)
);

WITH duplicate_fields AS (
    SELECT max(id)                       AS latest_field,
           array_agg(dataset_version_id) AS dsv_ids
    FROM dataset_field
    GROUP BY oddrn, type
    ORDER BY oddrn
)
INSERT INTO dataset_structure (dataset_version_id, dataset_field_id)
SELECT unnest(dsv_ids), latest_field FROM duplicate_fields;

WITH duplicate_fields AS (
    SELECT max(id) AS latest_field
    FROM dataset_field
    GROUP BY oddrn, type
    ORDER BY oddrn
)
DELETE FROM dataset_field WHERE id NOT IN (SELECT latest_field FROM duplicate_fields);

ALTER TABLE dataset_field
    DROP CONSTRAINT dataset_field_dataset_version_id_fkey,
    DROP COLUMN dataset_version_id
