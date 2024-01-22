CREATE TABLE IF NOT EXISTS relationship
(
    id                         bigserial PRIMARY KEY,
    name                       varchar(512),
    data_source_id             bigint,
    relationship_oddrn         varchar(512) UNIQUE,
    source_dataset_oddrn       varchar(512)       NOT NULL,
    target_dataset_oddrn       varchar(512)       NOT NULL,
    is_manualy_created         boolean,
    relationship_status        SMALLINT,
    last_ingested_at           TIMESTAMP WITHOUT TIME ZONE,
    deleted_at                 TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT relationship_fk_data_source FOREIGN KEY (data_source_id) REFERENCES data_source (id)
);

CREATE TABLE IF NOT EXISTS erd_relationship
(
    id                         bigserial PRIMARY KEY,
    relationship_id            bigint,
    source_dataset_field_oddrn varchar(512),
    target_dataset_field_oddrn varchar(512),
    is_identifying             boolean,
    cardinality                varchar(256),

    CONSTRAINT erd_relationship_fk_relationship FOREIGN KEY (relationship_id) REFERENCES relationship (id)
);

CREATE TABLE IF NOT EXISTS graph_relationship
(
    id                      bigserial PRIMARY KEY,
    relationship_id         bigint,
    is_derected             boolean,
    specific_attributes     jsonb,

    CONSTRAINT graph_relationship_fk_relationship FOREIGN KEY (relationship_id) REFERENCES relationship (id)
);


