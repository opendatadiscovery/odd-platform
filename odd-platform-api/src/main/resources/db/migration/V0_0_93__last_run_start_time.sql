-- #1794 defect 1: count in-flight RUNNING test runs on the Data Quality dashboard.
-- An in-flight run has no end_time, so the last-run rollup (data_entity_task_last_run) must order
-- runs by COALESCE(end_time, start_time) to pick the genuinely-latest run. That needs start_time
-- available on the denormalised last-run row (the table already denormalises status + end_time).
-- Additive + nullable: no existing row or reader is broken; the only writer (insertLastRuns) and the
-- dashboard readers tolerate a null start_time.
ALTER TABLE data_entity_task_last_run
    ADD COLUMN start_time TIMESTAMP WITHOUT TIME ZONE;

-- Backfill the new column for existing last-run rows from their referenced run.
UPDATE data_entity_task_last_run lr
SET start_time = tr.start_time
FROM data_entity_task_run tr
WHERE tr.oddrn = lr.last_task_run_oddrn;
