ALTER TABLE dataset_field
    ADD COLUMN IF NOT EXISTS internal_name VARCHAR;

ALTER TABLE data_entity_filled
    ADD COLUMN IF NOT EXISTS dataset_field_internal_name_filled BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE activity
SET old_state = old_state || '{"internal_name": null}'::jsonb
WHERE event_type IN ('DATASET_FIELD_DESCRIPTION_UPDATED', 'DATASET_FIELD_LABELS_UPDATED')
  AND old_state IS NOT NULL AND exists(SELECT 1 FROM jsonb_object_keys(old_state));

UPDATE activity
SET new_state = new_state || '{"internal_name": null}'::jsonb
WHERE event_type IN ('DATASET_FIELD_DESCRIPTION_UPDATED', 'DATASET_FIELD_LABELS_UPDATED')
  AND new_state IS NOT NULL AND exists(SELECT 1 FROM jsonb_object_keys(new_state));