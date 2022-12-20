CREATE TABLE IF NOT EXISTS alert_halt_config
(
    data_entity_id                  BIGINT UNIQUE               NOT NULL,
    failed_job_halt_until           TIMESTAMP WITHOUT TIME ZONE NULL,
    failed_dq_test_halt_until       TIMESTAMP WITHOUT TIME ZONE NULL,
    incompatible_schema_halt_until  TIMESTAMP WITHOUT TIME ZONE NULL,
    distribution_anomaly_halt_until TIMESTAMP WITHOUT TIME ZONE NULL,

    CONSTRAINT alert_halt_config_data_entity_id_fk FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);