CREATE TABLE IF NOT EXISTS link
(
    id             BIGSERIAL PRIMARY KEY,
    data_entity_id BIGINT                      NOT NULL,
    name           VARCHAR(255)                NOT NULL,
    url            TEXT                        NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),
    updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),
    deleted_at     TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT fk_link_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS file
(
    id             BIGSERIAL PRIMARY KEY,
    data_entity_id BIGINT                      NOT NULL,
    name           VARCHAR(255)                NOT NULL,
    path           TEXT                        NOT NULL,
    status         SMALLINT                    NOT NULL,
    upload_id      UUID                        NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),
    updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),
    deleted_at     TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT fk_file_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS file_data_entity_id_name_unique ON file (data_entity_id, name) WHERE file.deleted_at IS NULL;