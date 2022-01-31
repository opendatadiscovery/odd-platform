ALTER TABLE alert
    ALTER COLUMN data_entity_oddrn TYPE varchar,
    ALTER COLUMN messenger_entity_oddrn TYPE varchar;

ALTER TABLE data_entity
    ALTER COLUMN external_name TYPE varchar,
    ALTER COLUMN oddrn TYPE varchar;

ALTER TABLE data_entity_task_run
    ALTER COLUMN oddrn TYPE varchar,
    ALTER COLUMN status_reason TYPE varchar,
    ALTER COLUMN data_entity_oddrn TYPE varchar;

ALTER TABLE data_quality_test_relations
    ALTER COLUMN dataset_oddrn TYPE varchar,
    ALTER COLUMN data_quality_test_oddrn TYPE varchar;

ALTER TABLE data_source
    ALTER COLUMN oddrn TYPE varchar;

ALTER TABLE dataset_field
    ALTER COLUMN name TYPE varchar,
    ALTER COLUMN oddrn TYPE varchar,
    ALTER COLUMN parent_field_oddrn TYPE varchar,
    ALTER COLUMN external_description TYPE varchar;

ALTER TABLE dataset_version
    ALTER COLUMN version_hash TYPE varchar,
    ALTER COLUMN dataset_oddrn TYPE varchar;

ALTER TABLE group_entity_relations
    ALTER COLUMN group_oddrn TYPE varchar,
    ALTER COLUMN data_entity_oddrn TYPE varchar;

ALTER TABLE group_parent_group_relations
    ALTER COLUMN group_oddrn TYPE varchar,
    ALTER COLUMN parent_group_oddrn TYPE varchar;

ALTER TABLE lineage
    ALTER COLUMN parent_oddrn TYPE varchar,
    ALTER COLUMN child_oddrn TYPE varchar;

ALTER TABLE metadata_field
    ALTER COLUMN name TYPE varchar;