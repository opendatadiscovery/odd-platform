CREATE TABLE IF NOT EXISTS dataset_field_to_term
(
    dataset_field_id BIGINT,
    term_id          BIGINT,

    CONSTRAINT dataset_field_to_term_pk PRIMARY KEY (dataset_field_id, term_id),

    CONSTRAINT dataset_field_to_term_term_id_fkey FOREIGN KEY (term_id) REFERENCES term (id),
    CONSTRAINT dataset_field_to_term_data_entity_id_fkey FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id)
);

ALTER TABLE data_entity_filled
    ADD COLUMN IF NOT EXISTS dataset_field_terms_filled BOOLEAN NOT NULL DEFAULT FALSE;