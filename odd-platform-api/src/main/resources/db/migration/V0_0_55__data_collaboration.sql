CREATE TABLE IF NOT EXISTS message
(
    id                  BIGSERIAL PRIMARY KEY,
    data_entity_id      BIGINT                   NOT NULL,
    channel_id          VARCHAR(128)             NOT NULL,
    message_text        TEXT                     NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    sent_at             TIMESTAMP WITH TIME ZONE NULL,
    state               VARCHAR(64)              NOT NULL,
    provider            VARCHAR(64)              NOT NULL,
    provider_message_id VARCHAR(128)             NULL,

    CONSTRAINT fk_message_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

CREATE TABLE IF NOT EXISTS message_provider_event
(
    id         BIGSERIAL PRIMARY KEY,
    provider   VARCHAR(64)              NOT NULL,
    event      JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    state      VARCHAR(64)
)