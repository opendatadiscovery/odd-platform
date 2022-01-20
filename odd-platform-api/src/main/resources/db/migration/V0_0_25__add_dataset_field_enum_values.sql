CREATE TABLE IF NOT EXISTS enum_value
(
    id               bigserial PRIMARY KEY,
    name             varchar                     NOT NULL,
    description      varchar,
    dataset_field_id bigint                      NOT NULL,
    created_at       timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at       timestamp without time zone NOT NULL DEFAULT NOW(),
    is_deleted       boolean                     NOT NULL DEFAULT FALSE,

    CONSTRAINT enum_value_to_dataset_field_fk_field FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    UNIQUE (name, dataset_field_id)
);