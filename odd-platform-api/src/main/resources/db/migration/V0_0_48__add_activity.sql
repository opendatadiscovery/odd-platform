CREATE TABLE IF NOT EXISTS activity
(
    id              bigserial   not null,
    data_entity_id  bigint      NOT NULL,
    event_type      varchar(50) NOT NULL,
    old_state       jsonb,
    new_state       jsonb,
    is_system_event boolean     NOT NULL,
    created_at      timestamp   NOT NULL DEFAULT NOW(),
    created_by      varchar(512),
    PRIMARY KEY (id, created_at),
    CONSTRAINT activity_data_entity_id_fk FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
) PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS activity_created_at_idx ON activity (created_at);

CREATE INDEX IF NOT EXISTS activity_data_entity_id_idx ON activity (data_entity_id);