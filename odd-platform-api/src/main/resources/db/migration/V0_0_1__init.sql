CREATE TABLE IF NOT EXISTS owner
(
    id         bigserial PRIMARY KEY,
    name       varchar(255)                NOT NULL UNIQUE,
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS namespace
(
    id         bigserial PRIMARY KEY,
    name       varchar(64),
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tag
(
    id         bigserial PRIMARY KEY,
    name       varchar(64) UNIQUE,
    important  boolean                     NOT NULL,
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS label
(
    id         bigserial PRIMARY KEY,
    name       varchar(64) UNIQUE,
    is_deleted boolean                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_source
(
    id               bigserial PRIMARY KEY,
    name             varchar(255) UNIQUE,
    oddrn            varchar(255) UNIQUE,
    description      varchar(255),
    active           boolean,
    connection_url   varchar(255),
    is_deleted       boolean                     NOT NULL DEFAULT FALSE,
    created_at       timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at       timestamp without time zone NOT NULL DEFAULT NOW(),
    pulling_interval integer
);

-- static dict for data entity types
CREATE TABLE IF NOT EXISTS data_entity_type
(
    id   bigserial PRIMARY KEY,
    name varchar(64) UNIQUE
);

-- static dict for data entity subtypes
CREATE TABLE IF NOT EXISTS data_entity_subtype
(
    id   bigserial PRIMARY KEY,
    name varchar(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS data_entity
(
    id                   bigserial PRIMARY KEY,
    internal_name        varchar(255),
    external_name        varchar(255),
    oddrn                varchar(255) UNIQUE,
    data_source_id       bigint,
    owner_id             bigint,
    namespace_id         bigint,
    created_at           timestamp without time zone,
    updated_at           timestamp without time zone,
    subtype_id           bigint,
    specific_attributes  jsonb,
    external_description text,
    internal_description text,

    CONSTRAINT data_entity_fk_data_source FOREIGN KEY (data_source_id) REFERENCES data_source (id),
    CONSTRAINT data_entity_fk_owner FOREIGN KEY (owner_id) REFERENCES owner (id),
    CONSTRAINT data_entity_fk_namespace FOREIGN KEY (namespace_id) REFERENCES namespace (id),
    CONSTRAINT data_entity_fk_subtype FOREIGN KEY (subtype_id) REFERENCES data_entity_subtype (id)
);

CREATE TABLE IF NOT EXISTS type_subtype_relation
(
    type_id    bigint,
    subtype_id bigint,

    CONSTRAINT type_subtype_relation_pk PRIMARY KEY (type_id, subtype_id),

    CONSTRAINT type_subtype_relation_fk_type FOREIGN KEY (type_id) REFERENCES data_entity_type (id),
    CONSTRAINT type_subtype_relation_fk_subtype FOREIGN KEY (subtype_id) REFERENCES data_entity_subtype (id)

);

CREATE TABLE IF NOT EXISTS type_entity_relation
(
    data_entity_id      bigint,
    data_entity_type_id bigint,

    CONSTRAINT type_relation_pk PRIMARY KEY (data_entity_id, data_entity_type_id),

    CONSTRAINT type_entity_relation_fk_entity FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT type_entity_relation_fk_type FOREIGN KEY (data_entity_type_id) REFERENCES data_entity_type (id)
);

CREATE TABLE IF NOT EXISTS data_entity_task_run
(
    id             bigserial PRIMARY KEY,
    oddrn          varchar(255) UNIQUE,
    data_entity_id bigint,
    start_time     timestamp without time zone,
    end_time       timestamp without time zone,
    status_reason  varchar(255),
    status         varchar(64),
    type           varchar(64),

    CONSTRAINT data_entity_task_run_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS dataset_revision
(
    data_entity_id bigint                      NOT NULL,
    updated_at     timestamp without time zone NOT NULL,
    rows_count     bigint,

    CONSTRAINT dataset_revision_pk PRIMARY KEY (data_entity_id, updated_at),

    CONSTRAINT dataset_revision_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);


CREATE TABLE IF NOT EXISTS dataset_version
(
    id           bigserial PRIMARY KEY,
    dataset_id   bigint,
    version      bigint,
    version_hash varchar(512),
    created_at   timestamp without time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT dataset_version_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS dataset_field
(
    id                   bigserial PRIMARY KEY,
    dataset_version_id   bigint,
    name                 varchar(255),
    oddrn                varchar(255),
    parent_field_oddrn   varchar(255),
    field_order          integer,
    stats                jsonb,
    type                 jsonb,
    is_key               boolean,
    is_value             boolean,
    external_description varchar(255),
    internal_description varchar(255),

    CONSTRAINT dataset_field_dataset_version_id_fkey FOREIGN KEY (dataset_version_id) REFERENCES dataset_version (id)
);

CREATE TABLE IF NOT EXISTS metadata_field
(
    id         bigserial PRIMARY KEY,
    type       varchar(64),
    name       varchar(256),
    origin     varchar(8) NOT NULL DEFAULT 'INTERNAL'::varchar,
    is_deleted boolean    NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS metadata_field_value
(
    data_entity_id    bigint NOT NULL,
    metadata_field_id bigint NOT NULL,
    value             text,
    active            boolean DEFAULT TRUE,

    CONSTRAINT metadata_field_value_pk PRIMARY KEY (data_entity_id, metadata_field_id),

    CONSTRAINT metadata_field_value_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT metadata_field_value_metadata_field_id_fkey FOREIGN KEY (metadata_field_id) REFERENCES metadata_field (id)
);

CREATE TABLE IF NOT EXISTS search_entrypoint
(
    data_entity_id     bigserial PRIMARY KEY,
    data_entity_vector tsvector,
    tag_vector         tsvector,
    metadata_vector    tsvector,
    structure_vector   tsvector,
    task_run_vector    tsvector,
    search_vector      tsvector GENERATED ALWAYS
                           AS (data_entity_vector || tag_vector || metadata_vector || structure_vector ||
                               task_run_vector)
                           STORED,

    CONSTRAINT search_entrypoint_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS search_facets
(
--     TODO: find more clever way to generate uuid
--     TODO: find a way to define TTL
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query_string varchar(255),
    filters      jsonb
);

CREATE TABLE IF NOT EXISTS tag_to_data_entity
(
    tag_id         bigint NOT NULL,
    data_entity_id bigint NOT NULL,

    CONSTRAINT tag_to_data_entity_pk PRIMARY KEY (tag_id, data_entity_id),

    CONSTRAINT tag_to_data_entity_data_entity_id_fkey FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT tag_to_data_entity_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tag (id)
);

CREATE TABLE IF NOT EXISTS label_to_dataset_field
(
    label_id         bigint NOT NULL,
    dataset_field_id bigint NOT NULL,

    CONSTRAINT label_to_dataset_field_pk PRIMARY KEY (label_id, dataset_field_id),

    CONSTRAINT label_to_dataset_field_fk_field FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT label_to_dataset_field_fk_label FOREIGN KEY (label_id) REFERENCES label (id)
);

CREATE INDEX search_entrypoint_search_vector_idx
    ON search_entrypoint USING gin (search_vector);

CREATE UNIQUE INDEX ix_unique_external_name_type
    ON metadata_field USING btree (type, name)
    WHERE ((origin)::text <> 'INTERNAL'::text);

CREATE UNIQUE INDEX ix_unique_internal_name
    ON metadata_field USING btree (name)
    WHERE ((origin)::text = 'INTERNAL'::text);

CREATE UNIQUE INDEX ix_unique_data_entity_oddrn
    ON data_entity USING btree (oddrn);

-- filling in static type/subtype information
INSERT INTO data_entity_type (name)
VALUES ('DATA_SET'),
       ('DATA_TRANSFORMER'),
       ('DATA_TRANSFORMER_RUN'),
       ('DATA_QUALITY_TEST'),
       ('DATA_QUALITY_TEST_RUN'),
       ('DATA_CONSUMER'),
       ('DATA_INPUT');

INSERT INTO data_entity_subtype (name)
VALUES ('TABLE'),
       ('FILE'),
       ('FEATURE_GROUP'),
       ('TOPIC'),
       ('JOB'),
       ('EXPERIMENT'),
       ('ML_MODEL_TRAINING'),
       ('ML_MODEL_INSTANCE'),
       ('DASHBOARD'),
       ('ML_MODEL_ARTIFACT'),
       ('VIEW');

-- TODO: filth: either remove autoincrement in tables or make select by names
INSERT INTO type_subtype_relation (type_id, subtype_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (1, 4),
       (2, 5),
       (2, 6),
       (2, 7),
       (2, 8),
       (3, 9),
       (3, 10),
       (1, 11),
       (2, 11)