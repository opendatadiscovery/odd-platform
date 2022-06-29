CREATE TABLE IF NOT EXISTS activity
(
    data_entity_id bigint       NOT NULL,
    event_type     varchar(50)  NOT NULL,
    old_state      jsonb,
    new_state      jsonb,
    created_at     timestamp    NOT NULL DEFAULT NOW(),
    created_by     varchar(512),

    CONSTRAINT activity_data_entity_id_fk FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
) PARTITION BY RANGE ((date_trunc('day', created_at)));

CREATE INDEX ON activity (created_at);