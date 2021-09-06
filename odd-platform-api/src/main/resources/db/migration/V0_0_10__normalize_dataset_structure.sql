CREATE TABLE dataset_structure
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

ALTER TABLE dataset_field
    DROP CONSTRAINT dataset_field_dataset_version_id_fkey,
    DROP COLUMN dataset_version_id
