CREATE EXTENSION IF NOT EXISTS intarray;

CREATE TABLE IF NOT EXISTS metric_entity
(
    id           SERIAL PRIMARY KEY,
    entity_oddrn VARCHAR NOT NULL, -- oddrn of entity, which has metrics. It can be data entity oddrn or dataset field oddrn

    CONSTRAINT metric_entity_entity_oddrn_key UNIQUE (entity_oddrn)
);

CREATE TABLE IF NOT EXISTS metric_label
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,

    CONSTRAINT metric_label_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS metric_label_value
(
    id              SERIAL PRIMARY KEY,
    value           VARCHAR NOT NULL,
    metric_label_id INT     NOT NULL,

    CONSTRAINT metric_label_value_metric_label_fk FOREIGN KEY (metric_label_id) REFERENCES metric_label (id),
    CONSTRAINT metric_label_value_value_metric_label_id_key UNIQUE (value, metric_label_id)
);

CREATE TABLE IF NOT EXISTS metric_family
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR NOT NULL,
    description VARCHAR,
    type        VARCHAR NOT NULL,
    unit        VARCHAR NOT NULL,

    CONSTRAINT metric_family_name_type_unit_key UNIQUE (name, type, unit)
);

CREATE TABLE IF NOT EXISTS metric_series
(
    id                SERIAL PRIMARY KEY,
    metric_family_id  INT NOT NULL,
    metric_entity_id  INT NOT NULL,
    metric_labels_ids INT[],
    value_type        INT NOT NULL,
    CHECK (metric_labels_ids = sort(metric_labels_ids)),

    CONSTRAINT metric_series_metric_family_fk FOREIGN KEY (metric_family_id) REFERENCES metric_family (id),
    CONSTRAINT metric_series_metric_entity_fk FOREIGN KEY (metric_entity_id) REFERENCES metric_entity (id),
    CONSTRAINT metric_series_unique_key UNIQUE (metric_family_id, metric_entity_id, metric_labels_ids, value_type)
);

CREATE TABLE IF NOT EXISTS metric_point
(
    timestamp        TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    series_id        INT                         NOT NULL,
    label_values_ids INT[],
    value            FLOAT,

    PRIMARY KEY (series_id, label_values_ids),
    CHECK (label_values_ids = sort(label_values_ids)),
    CONSTRAINT metric_point_metric_series_fk FOREIGN KEY (series_id) REFERENCES metric_series (id)
);

CREATE TABLE IF NOT EXISTS external_metric_last_value
(
    id               BIGSERIAL PRIMARY KEY,
    oddrn            VARCHAR                     NOT NULL,
    metric_family_id INT                         NOT NULL,
    labels           jsonb                       NOT NULL,
    timestamp        TIMESTAMP WITHOUT TIME ZONE NOT NULL,

    CONSTRAINT external_metric_last_ingestion_metric_family_fk FOREIGN KEY (metric_family_id) REFERENCES metric_family (id),
    CONSTRAINT external_metric_last_value_key UNIQUE (oddrn, metric_family_id)
);