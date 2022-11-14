CREATE TABLE IF NOT EXISTS message
(
    uuid                    UUID                     NOT NULL,
    parent_message_uuid     UUID,
    data_entity_id          BIGINT                   NOT NULL,
    text                    TEXT                     NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at                 TIMESTAMP WITH TIME ZONE NULL,
    state                   SMALLINT                 NOT NULL,
    error_message           TEXT,
    owner_id                BIGINT,
    provider                VARCHAR(64)              NOT NULL,
    provider_channel_id     VARCHAR(128),
    provider_channel_name   VARCHAR(128),
    provider_message_id     VARCHAR(128)             NULL,
    provider_message_author VARCHAR(256),

    PRIMARY KEY (created_at, uuid),
    CONSTRAINT fk_message_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id),
    CONSTRAINT fk_message_owner_id FOREIGN KEY (owner_id) REFERENCES owner (id)
) PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS message_created_at_idx ON message (created_at);

CREATE TABLE IF NOT EXISTS message_provider_event
(
    id                        BIGSERIAL PRIMARY KEY,
    parent_message_uuid       UUID                     NOT NULL,
    parent_message_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider                  VARCHAR(64)              NOT NULL,
    action                    SMALLINT                 NOT NULL,
    event                     JSONB,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    state                     SMALLINT,
    error_message             TEXT,

    CONSTRAINT fk_parent_message_id FOREIGN KEY (parent_message_uuid, parent_message_created_at)
        REFERENCES message (uuid, created_at)
)