CREATE TABLE IF NOT EXISTS relationships
(
    id                         bigserial PRIMARY KEY,
    data_entity_id             bigint,
    source_dataset_oddrn       varchar(512)       NOT NULL,
    target_dataset_oddrn       varchar(512)       NOT NULL,
    relationship_type          varchar(256),

    CONSTRAINT relationship_fk_data_entity FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS erd_relationship_details
(
    id                         bigserial PRIMARY KEY,
    relationship_id            bigint,
    source_dataset_field_oddrn varchar(512)[],
    target_dataset_field_oddrn varchar(512)[],
    is_identifying             boolean,
    cardinality                varchar(256),

    CONSTRAINT erd_relationship_fk_relationship FOREIGN KEY (relationship_id) REFERENCES relationships (id)
);

CREATE TABLE IF NOT EXISTS graph_relationship
(
    id                      bigserial PRIMARY KEY,
    relationship_id         bigint,
    is_directed             boolean,
    specific_attributes     jsonb,

    CONSTRAINT graph_relationship_fk_relationship FOREIGN KEY (relationship_id) REFERENCES relationships (id)
);


