ALTER TABLE data_entity_to_term
    ADD COLUMN IF NOT EXISTS description_link boolean DEFAULT FALSE;

UPDATE data_entity_to_term
SET description_link = FALSE;

ALTER TABLE data_entity_to_term
    ALTER COLUMN description_link SET NOT NULL;

ALTER TABLE data_entity_to_term
    DROP CONSTRAINT data_entity_to_term_pk;

ALTER TABLE data_entity_to_term
    ADD CONSTRAINT data_entity_to_term_pk PRIMARY KEY (data_entity_id, term_id, description_link);

ALTER TABLE dataset_field_to_term
    ADD COLUMN IF NOT EXISTS description_link boolean DEFAULT FALSE;

UPDATE dataset_field_to_term
SET description_link = FALSE;

ALTER TABLE dataset_field_to_term
    ALTER COLUMN description_link SET NOT NULL;

ALTER TABLE dataset_field_to_term
    DROP CONSTRAINT dataset_field_to_term_pk;

ALTER TABLE dataset_field_to_term
    ADD CONSTRAINT dataset_field_to_term_pk PRIMARY KEY (dataset_field_id, term_id, description_link);