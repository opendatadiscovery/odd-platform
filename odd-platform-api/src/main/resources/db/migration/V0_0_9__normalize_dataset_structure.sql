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

CREATE TEMP TABLE duplicate_fields AS
WITH cte AS (
    SELECT array_agg(id order by id desc) AS field_ids,
           array_agg(dataset_version_id)  AS dsv_ids
    FROM dataset_field
    GROUP BY oddrn, type
    ORDER BY oddrn
)
SELECT * from cte;

INSERT INTO dataset_structure (dataset_version_id, dataset_field_id)
SELECT unnest(dsv_ids), field_ids[1] FROM duplicate_fields;

INSERT INTO label_to_dataset_field (label_id, dataset_field_id)
    SELECT label_id, duplicate_fields.field_ids[1]
    FROM duplicate_fields
    JOIN label_to_dataset_field ON label_to_dataset_field.dataset_field_id = ANY(duplicate_fields.field_ids[2:])
ON CONFLICT DO NOTHING;

DELETE FROM label_to_dataset_field WHERE dataset_field_id NOT IN (SELECT field_ids[1] FROM duplicate_fields);
DELETE FROM dataset_field WHERE id NOT IN (SELECT field_ids[1] FROM duplicate_fields);

ALTER TABLE dataset_field
    DROP CONSTRAINT dataset_field_dataset_version_id_fkey,
    DROP COLUMN dataset_version_id
