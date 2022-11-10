CREATE TABLE IF NOT EXISTS message
(
    id                      BIGSERIAL PRIMARY KEY,
    parent_message_id       BIGINT,
    data_entity_id          BIGINT                   NOT NULL,
    text                    TEXT                     NOT NULL,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    sent_at                 TIMESTAMP WITH TIME ZONE NULL,
    state                   VARCHAR(64)              NOT NULL,
    provider                VARCHAR(64)              NOT NULL,
    provider_channel_id     VARCHAR(128)             NOT NULL,
    provider_message_id     VARCHAR(128)             NULL,
    provider_message_author VARCHAR(256),

    CONSTRAINT fk_message_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE INDEX IF NOT EXISTS message_created_at_idx ON message (created_at);
CREATE UNIQUE INDEX external_message_unique_idx ON message (provider_message_id, provider)
    WHERE provider_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS message_provider_event
(
    id                BIGSERIAL PRIMARY KEY,
    parent_message_id BIGINT                   NOT NULL,
    provider          VARCHAR(64)              NOT NULL,
    action            VARCHAR(64)              NOT NULL,
    event             JSONB,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    state             VARCHAR(64),
    error_message     TEXT,

    CONSTRAINT fk_parent_message_id FOREIGN KEY (parent_message_id) REFERENCES message (id)
)