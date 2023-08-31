ALTER TABLE dataset_field
    ADD COLUMN IF NOT EXISTS internal_name VARCHAR;

ALTER TABLE data_entity_filled
    ADD COLUMN IF NOT EXISTS dataset_field_internal_name_filled BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE activity
SET old_state = (SELECT jsonb_agg(elem || '{"internal_name": null}') FROM jsonb_array_elements(old_state) AS elem)
WHERE event_type IN ('DATASET_FIELD_DESCRIPTION_UPDATED', 'DATASET_FIELD_LABELS_UPDATED')
  AND jsonb_array_length(old_state) <> 0;

UPDATE activity
SET new_state = (SELECT jsonb_agg(elem || '{"internal_name": null}') FROM jsonb_array_elements(new_state) AS elem)
WHERE event_type IN ('DATASET_FIELD_DESCRIPTION_UPDATED', 'DATASET_FIELD_LABELS_UPDATED')
  AND jsonb_array_length(old_state) <> 0;