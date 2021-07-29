CREATE TABLE IF NOT EXISTS alert
(
    id                bigserial PRIMARY KEY,
    data_entity_oddrn varchar(255)                NOT NULL,
    description       varchar(512)                NOT NULL,
    type              varchar(64)                 NOT NULL,
    status            varchar(64)                 NOT NULL,
    status_updated_at timestamp without time zone NOT NULL,
    created_at        timestamp without time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT alert_fk_data_entity FOREIGN KEY (data_entity_oddrn) REFERENCES data_entity (oddrn)
)