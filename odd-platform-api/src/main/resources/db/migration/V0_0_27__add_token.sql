CREATE TABLE IF NOT EXISTS token
(
    id          bigserial PRIMARY KEY,
    name        varchar(64) NOT NULL,
    description varchar(255),
    value       varchar(40) NOT NULL,
    created_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    created_by  varchar(255),
    updated_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_by  varchar(255)
);

ALTER TABLE data_source
    ADD token_id bigint,
    ADD CONSTRAINT data_source_fk_token FOREIGN KEY (token_id) REFERENCES token (id);
