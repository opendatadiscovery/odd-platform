CREATE TABLE IF NOT EXISTS data_quality_test_severity
(
    data_quality_test_id BIGINT REFERENCES data_entity(id),
    dataset_id           BIGINT REFERENCES data_entity(id),
    severity             VARCHAR(8),

    CONSTRAINT data_quality_test_severity_pk PRIMARY KEY (data_quality_test_id, dataset_id)
);