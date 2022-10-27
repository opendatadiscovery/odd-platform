CREATE TABLE IF NOT EXISTS message
(
    id             BIGSERIAL PRIMARY KEY,
    data_entity_id BIGINT                   NOT NULL,
    channel_id     VARCHAR(128)             NOT NULL,
    message_text   TEXT                     NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
    sent_at        TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT fk_message_data_entity_id FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);