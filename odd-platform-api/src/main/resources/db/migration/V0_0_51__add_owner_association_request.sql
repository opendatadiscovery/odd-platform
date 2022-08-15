CREATE TABLE IF NOT EXISTS owner_association_request
(
    id                bigserial PRIMARY KEY,
    username          varchar(512)                NOT NULL,
    owner_id          bigint                      NOT NULL,
    status            varchar(64)                 NOT NULL,
    status_updated_at timestamp without time zone,
    status_updated_by varchar(512),
    created_at        timestamp without time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT owner_association_request_owner_fk FOREIGN KEY (owner_id) REFERENCES owner (id),
    UNIQUE (username, owner_id, status)
)