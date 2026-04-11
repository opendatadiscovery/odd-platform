CREATE TABLE IF NOT EXISTS data_entity_description_unhandled_term
(
    id                  BIGSERIAL PRIMARY KEY,
    data_entity_id      BIGINT                      NOT NULL,
    term_name           varchar(255)                NOT NULL,
    term_namespace_name varchar(64)                 NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),

    CONSTRAINT fk_data_entity_description_unhandled_term_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT data_entity_description_unhandled_term_unique_key UNIQUE (data_entity_id, term_name, term_namespace_name)
);

CREATE TABLE IF NOT EXISTS dataset_field_description_unhandled_term
(
    id                  BIGSERIAL PRIMARY KEY,
    dataset_field_id    BIGINT                      NOT NULL,
    term_name           varchar(255)                NOT NULL,
    term_namespace_name varchar(64)                 NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),

    CONSTRAINT fk_dataset_field_description_unhandled_term_dataset_field_id FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT dataset_field_description_unhandled_term_unique_key UNIQUE (dataset_field_id, term_name, term_namespace_name)
);

UPDATE activity
SET old_state = (SELECT jsonb_agg(elem || '{"is_description_link": false}') FROM jsonb_array_elements(old_state) AS elem)
WHERE event_type IN ('TERM_ASSIGNED', 'TERM_ASSIGNMENT_DELETED')
  AND jsonb_array_length(old_state) <> 0;

UPDATE activity
SET new_state = (SELECT jsonb_agg(elem || '{"is_description_link": false}') FROM jsonb_array_elements(new_state) AS elem)
WHERE event_type IN ('TERM_ASSIGNED', 'TERM_ASSIGNMENT_DELETED')
  AND jsonb_array_length(new_state) <> 0;

UPDATE activity
SET old_state = (SELECT jsonb_set(old_state::jsonb, '{terms}',
                                  (SELECT jsonb_agg(elem || '{"is_description_link": false}')
                                   FROM jsonb_array_elements(old_state -> 'terms') AS elem)::jsonb
                            ))
WHERE event_type IN ('DATASET_FIELD_TERM_ASSIGNED', 'DATASET_FIELD_TERM_ASSIGNMENT_DELETED')
  AND jsonb_array_length(old_state -> 'terms') <> 0;

UPDATE activity
SET new_state = (SELECT jsonb_set(new_state::jsonb, '{terms}',
                                  (SELECT jsonb_agg(elem || '{"is_description_link": false}')
                                   FROM jsonb_array_elements(new_state -> 'terms') AS elem)::jsonb
                            ))
WHERE event_type IN ('DATASET_FIELD_TERM_ASSIGNED', 'DATASET_FIELD_TERM_ASSIGNMENT_DELETED')
  AND jsonb_array_length(new_state -> 'terms') <> 0;

UPDATE activity
SET event_type = 'TERM_ASSIGNMENT_UPDATED'
WHERE event_type IN ('TERM_ASSIGNED', 'TERM_ASSIGNMENT_DELETED');

UPDATE activity
SET event_type = 'DATASET_FIELD_TERM_ASSIGNMENT_UPDATED'
WHERE event_type IN ('DATASET_FIELD_TERM_ASSIGNED', 'DATASET_FIELD_TERM_ASSIGNMENT_DELETED');
