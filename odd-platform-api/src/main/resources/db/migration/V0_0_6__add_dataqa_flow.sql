ALTER TABLE data_entity_task_run
    ADD COLUMN IF NOT EXISTS data_entity_oddrn varchar(255),
    ADD COLUMN IF NOT EXISTS name varchar(255),
    DROP COLUMN IF EXISTS data_entity_id;

CREATE TABLE IF NOT EXISTS data_quality_test_relations (
    dataset_oddrn varchar(255),
    data_quality_test_oddrn varchar(255),

    CONSTRAINT data_quality_test_relations_pk PRIMARY KEY (dataset_oddrn, data_quality_test_oddrn)
);