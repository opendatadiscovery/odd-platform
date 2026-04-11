ALTER TABLE data_entity_task_run
    RENAME COLUMN data_entity_oddrn TO task_oddrn;

ALTER TABLE data_entity_task_run
    ADD CONSTRAINT data_entity_task_run_task_oddrn_fk FOREIGN KEY (task_oddrn) REFERENCES data_entity (oddrn);

CREATE TABLE IF NOT EXISTS data_entity_task_last_run
(
    task_oddrn          VARCHAR PRIMARY KEY REFERENCES data_entity (oddrn),
    last_task_run_oddrn VARCHAR NOT NULL REFERENCES data_entity_task_run (oddrn),
    end_time            TIMESTAMP WITHOUT TIME ZONE,
    status              VARCHAR(64)
);

INSERT INTO data_entity_task_last_run
SELECT DISTINCT ON (tr.task_oddrn) tr.task_oddrn AS task_oddrn,
                                   tr.oddrn      AS last_task_run_oddrn,
                                   tr.end_time   AS end_time,
                                   tr.status     AS status
FROM data_entity_task_run tr
ORDER BY tr.task_oddrn, tr.end_time DESC
ON CONFLICT (task_oddrn) DO UPDATE
    SET last_task_run_oddrn = excluded.last_task_run_oddrn,
        end_time            = excluded.end_time,
        status              = excluded.status