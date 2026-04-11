CREATE INDEX IF NOT EXISTS data_entity_task_run_data_entity_oddrn_idx
    ON data_entity_task_run (data_entity_oddrn);

CREATE INDEX IF NOT EXISTS data_entity_task_run_end_time_idx
    ON data_entity_task_run (end_time);

UPDATE data_entity_task_run
SET status = 'RUNNING'
WHERE status IS NULL
   OR status = '';

ALTER TABLE data_entity_task_run
    ALTER COLUMN status SET NOT NULL;