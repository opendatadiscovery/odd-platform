create table flyway_schema_history
(
    installed_rank integer                 not null,
    version        varchar(50),
    description    varchar(200)            not null,
    type           varchar(20)             not null,
    script         varchar(1000)           not null,
    checksum       integer,
    installed_by   varchar(100)            not null,
    installed_on   timestamp default now() not null,
    execution_time integer                 not null,
    success        boolean                 not null,
    constraint flyway_schema_history_pk
        primary key (installed_rank)
);

create index flyway_schema_history_s_idx
    on flyway_schema_history (success);

create table owner
(
    id         bigserial               not null,
    name       varchar(255)            not null,
    is_deleted boolean   default false not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    constraint owner_pkey
        primary key (id),
    constraint owner_name_key
        unique (name)
);

create table namespace
(
    id         bigserial               not null,
    name       varchar(64),
    is_deleted boolean   default false not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    constraint namespace_pkey
        primary key (id)
);

create table tag
(
    id         bigserial               not null,
    name       varchar(64),
    important  boolean                 not null,
    is_deleted boolean   default false not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    constraint tag_pkey
        primary key (id),
    constraint tag_name_key
        unique (name)
);

create table label
(
    id         bigserial               not null,
    name       varchar(64),
    is_deleted boolean   default false not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    constraint label_pkey
        primary key (id),
    constraint label_name_key
        unique (name)
);

create table data_source
(
    id               bigserial               not null,
    name             varchar(255),
    oddrn            varchar(255),
    description      varchar(255),
    active           boolean,
    connection_url   varchar(255),
    is_deleted       boolean   default false not null,
    created_at       timestamp default now() not null,
    updated_at       timestamp default now() not null,
    pulling_interval integer,
    namespace_id     bigint,
    constraint data_source_pkey
        primary key (id),
    constraint data_source_name_key
        unique (name),
    constraint data_source_oddrn_key
        unique (oddrn),
    constraint data_source_namespace_id_fkey
        foreign key (namespace_id) references namespace
);

create table data_entity_type
(
    id   bigserial not null,
    name varchar(64),
    constraint data_entity_type_pkey
        primary key (id),
    constraint data_entity_type_name_key
        unique (name)
);

create table data_entity_subtype
(
    id   bigserial not null,
    name varchar(64),
    constraint data_entity_subtype_pkey
        primary key (id),
    constraint data_entity_subtype_name_key
        unique (name)
);

create table data_entity
(
    id                   bigserial             not null,
    internal_name        varchar(255),
    external_name        varchar(255),
    oddrn                varchar(255),
    data_source_id       bigint,
    created_at           timestamp,
    updated_at           timestamp,
    subtype_id           bigint,
    specific_attributes  jsonb,
    external_description text,
    internal_description text,
    hollow               boolean default false not null,
    view_count           bigint  default 0,
    constraint data_entity_pkey
        primary key (id),
    constraint data_entity_oddrn_key
        unique (oddrn),
    constraint data_entity_fk_data_source
        foreign key (data_source_id) references data_source,
    constraint data_entity_fk_subtype
        foreign key (subtype_id) references data_entity_subtype
);

create unique index ix_unique_data_entity_oddrn
    on data_entity (oddrn);

create table type_subtype_relation
(
    type_id    bigint not null,
    subtype_id bigint not null,
    constraint type_subtype_relation_pk
        primary key (type_id, subtype_id),
    constraint type_subtype_relation_fk_type
        foreign key (type_id) references data_entity_type,
    constraint type_subtype_relation_fk_subtype
        foreign key (subtype_id) references data_entity_subtype
);

create table type_entity_relation
(
    data_entity_id      bigint not null,
    data_entity_type_id bigint not null,
    constraint type_relation_pk
        primary key (data_entity_id, data_entity_type_id),
    constraint type_entity_relation_fk_entity
        foreign key (data_entity_id) references data_entity,
    constraint type_entity_relation_fk_type
        foreign key (data_entity_type_id) references data_entity_type
);

create table data_entity_task_run
(
    id                bigserial not null,
    oddrn             varchar(255),
    start_time        timestamp,
    end_time          timestamp,
    status_reason     varchar(255),
    status            varchar(64),
    type              varchar(64),
    data_entity_oddrn varchar(255),
    name              varchar(255),
    constraint data_entity_task_run_pkey
        primary key (id),
    constraint data_entity_task_run_oddrn_key
        unique (oddrn)
);

create table dataset_version
(
    id            bigserial               not null,
    version       bigint,
    version_hash  varchar(512),
    created_at    timestamp default now() not null,
    dataset_oddrn varchar(255)            not null,
    constraint dataset_version_pkey
        primary key (id),
    constraint dataset_version_fk_data_entity
        foreign key (dataset_oddrn) references data_entity (oddrn)
);

create table dataset_field
(
    id                   bigserial not null,
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
    constraint dataset_field_pkey
        primary key (id)
);

create index dataset_field_oddrn_index
    on dataset_field (oddrn);

create table metadata_field
(
    id         bigserial                                        not null,
    type       varchar(64),
    name       varchar(256),
    origin     varchar(8) default 'INTERNAL'::character varying not null,
    is_deleted boolean    default false                         not null,
    constraint metadata_field_pkey
        primary key (id)
);

create unique index ix_unique_external_name_type
    on metadata_field (type, name)
    where ((origin)::text <> 'INTERNAL'::text);

create unique index ix_unique_internal_name
    on metadata_field (name)
    where ((origin)::text = 'INTERNAL'::text);

create table metadata_field_value
(
    data_entity_id    bigint not null,
    metadata_field_id bigint not null,
    value             text,
    active            boolean default true,
    constraint metadata_field_value_pk
        primary key (data_entity_id, metadata_field_id),
    constraint metadata_field_value_data_entity_id_fkey
        foreign key (data_entity_id) references data_entity,
    constraint metadata_field_value_metadata_field_id_fkey
        foreign key (metadata_field_id) references metadata_field
);

create table search_entrypoint
(
    data_entity_id     bigserial not null,
    data_entity_vector tsvector,
    tag_vector         tsvector,
    metadata_vector    tsvector,
    structure_vector   tsvector,
    task_run_vector    tsvector,
    namespace_vector   tsvector,
    data_source_vector tsvector,
    owner_vector       tsvector,
    search_vector      tsvector GENERATED ALWAYS
                           AS (data_entity_vector || tag_vector || metadata_vector ||
                               structure_vector ||
                               task_run_vector)
                           STORED,
    constraint search_entrypoint_pkey
        primary key (data_entity_id),
    constraint search_entrypoint_data_entity_id_fkey
        foreign key (data_entity_id) references data_entity
);

create index search_entrypoint_search_vector_gin_idx
    on search_entrypoint using gin (search_vector);

create table search_facets
(
    id           uuid default gen_random_uuid() not null,
    query_string varchar(255),
    filters      jsonb,
    constraint search_facets_pkey
        primary key (id)
);

create table tag_to_data_entity
(
    tag_id         bigint not null,
    data_entity_id bigint not null,
    constraint tag_to_data_entity_pk
        primary key (tag_id, data_entity_id),
    constraint tag_to_data_entity_data_entity_id_fkey
        foreign key (data_entity_id) references data_entity,
    constraint tag_to_data_entity_tag_id_fkey
        foreign key (tag_id) references tag
);

create table label_to_dataset_field
(
    label_id         bigint not null,
    dataset_field_id bigint not null,
    constraint label_to_dataset_field_pk
        primary key (label_id, dataset_field_id),
    constraint label_to_dataset_field_fk_field
        foreign key (dataset_field_id) references dataset_field,
    constraint label_to_dataset_field_fk_label
        foreign key (label_id) references label
);

create table lineage
(
    parent_oddrn varchar(512) not null,
    child_oddrn  varchar(512) not null,
    constraint lineage_pk
        primary key (parent_oddrn, child_oddrn)
);

create table role
(
    id         bigserial               not null,
    name       varchar(128),
    is_deleted boolean   default false not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    constraint role_pkey
        primary key (id),
    constraint role_name_key
        unique (name)
);

create table ownership
(
    id             bigserial not null,
    data_entity_id bigint,
    owner_id       bigint,
    role_id        bigint,
    constraint ownership_pkey
        primary key (id),
    constraint ownership_data_entity_id_owner_id_key
        unique (data_entity_id, owner_id),
    constraint ownership_fk_data_entity
        foreign key (data_entity_id) references data_entity,
    constraint ownership_fk_owner
        foreign key (owner_id) references owner,
    constraint ownership_fk_role
        foreign key (role_id) references role
);

create table user_owner_mapping
(
    owner_id      bigint,
    oidc_username varchar(512),
    constraint user_owner_mapping_owner_id_key
        unique (owner_id),
    constraint user_owner_mapping_oidc_username_key
        unique (oidc_username),
    constraint user_owner_mapping_fk_owner
        foreign key (owner_id) references owner
);

create table data_quality_test_relations
(
    dataset_oddrn           varchar(255) not null,
    data_quality_test_oddrn varchar(255) not null,
    constraint data_quality_test_relations_pk
        primary key (dataset_oddrn, data_quality_test_oddrn)
);

create table alert
(
    id                     bigserial               not null,
    description            varchar(512)            not null,
    type                   varchar(64)             not null,
    status                 varchar(64)             not null,
    status_updated_at      timestamp               not null,
    created_at             timestamp default now() not null,
    data_entity_oddrn      varchar(255)            not null,
    messenger_entity_oddrn varchar(255),
    constraint alert_pkey
        primary key (id),
    constraint alert_fk_data_entity
        foreign key (data_entity_oddrn) references data_entity (oddrn)
);

create table dataset_structure
(
    dataset_version_id bigint not null,
    dataset_field_id   bigint not null,
    constraint dataset_structure_pk
        primary key (dataset_version_id, dataset_field_id),
    constraint dataset_structure_dataset_version_id_fkey
        foreign key (dataset_version_id) references dataset_version,
    constraint dataset_structure_dataset_field_id_fkey
        foreign key (dataset_field_id) references dataset_field
);

