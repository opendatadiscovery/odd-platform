ALTER TABLE alert
    ADD COLUMN IF NOT EXISTS data_entity_oddrn varchar(255);

ALTER TABLE alert
    RENAME CONSTRAINT alert_fk_data_entity TO alert_fk_data_entity_tmp;

UPDATE alert
SET data_entity_oddrn=tmp.oddrn
FROM (SELECT id, oddrn FROM data_entity WHERE id IN (SELECT data_entity_id FROM alert)) AS tmp
WHERE alert.data_entity_id = tmp.id;

ALTER TABLE alert
    ADD CONSTRAINT alert_fk_data_entity FOREIGN KEY (data_entity_oddrn) REFERENCES data_entity (oddrn),
    DROP CONSTRAINT alert_fk_data_entity_tmp,
    DROP COLUMN data_entity_id,
    ALTER COLUMN data_entity_oddrn SET NOT NULL;

ALTER TABLE dataset_version
    ADD COLUMN IF NOT EXISTS dataset_oddrn varchar(255);

ALTER TABLE dataset_version
    RENAME CONSTRAINT dataset_version_dataset_id_fkey TO dataset_version_dataset_id_fkey_tmp;

UPDATE dataset_version
SET dataset_oddrn=tmp.oddrn
FROM (SELECT id, oddrn FROM data_entity WHERE id IN (SELECT dataset_id FROM dataset_version)) AS tmp
WHERE dataset_version.dataset_id = tmp.id;

ALTER TABLE dataset_version
    ADD CONSTRAINT dataset_version_fk_data_entity FOREIGN KEY (dataset_oddrn) REFERENCES data_entity (oddrn),
    DROP CONSTRAINT dataset_version_dataset_id_fkey_tmp,
    DROP COLUMN dataset_id,
    ALTER COLUMN dataset_oddrn SET NOT NULL;


