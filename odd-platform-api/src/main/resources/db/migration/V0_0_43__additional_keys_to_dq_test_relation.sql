ALTER TABLE data_quality_test_relations
    ADD CONSTRAINT IF NOT EXIST dqt_relation_dataset_oddrn_fk FOREIGN KEY (dataset_oddrn) REFERENCES data_entity (oddrn);

ALTER TABLE data_quality_test_relations
    ADD CONSTRAINT IF NOT EXIST dqt_relation_data_quality_test_oddrn_fk FOREIGN KEY (data_quality_test_oddrn) REFERENCES data_entity (oddrn)