ALTER TABLE dataset_field
    ADD COLUMN IF NOT EXISTS default_value varchar;

CREATE TABLE IF NOT EXISTS dataset_field_metadata_value
(
    dataset_field_id  bigint NOT NULL,
    metadata_field_id bigint NOT NULL,
    value             text,

    CONSTRAINT dataset_field_metadata_value_pk PRIMARY KEY (dataset_field_id, metadata_field_id),

    CONSTRAINT dataset_field_metadata_value_dataset_field_id_fkey FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT dataset_field_metadata_value_metadata_field_id_fkey FOREIGN KEY (metadata_field_id) REFERENCES metadata_field (id)
);