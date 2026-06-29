CREATE TABLE IF NOT EXISTS masking_rule
(
    id          bigserial PRIMARY KEY,
    name        varchar(255)                NOT NULL,
    type        varchar(64)                 NOT NULL,
    replacement varchar(255),
    pattern     varchar(512),
    created_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    is_deleted  boolean                     NOT NULL DEFAULT FALSE,
    deleted_at  timestamp without time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS masking_rule_name_unique
    ON masking_rule (name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS dataset_field_masking
(
    id               bigserial PRIMARY KEY,
    dataset_field_id bigint NOT NULL,
    masking_rule_id  bigint NOT NULL,
    created_at       timestamp without time zone NOT NULL DEFAULT NOW(),
    created_by       bigint,

    CONSTRAINT dataset_field_masking_field_id_fkey
        FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT dataset_field_masking_rule_id_fkey
        FOREIGN KEY (masking_rule_id) REFERENCES masking_rule (id),
    CONSTRAINT dataset_field_masking_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES owner (id),
    CONSTRAINT dataset_field_masking_unique UNIQUE (dataset_field_id)
);

INSERT INTO masking_rule(name, type, replacement, pattern)
VALUES ('Show Last 4 Characters', 'SHOW_LAST_4', NULL, NULL),
       ('Show First 4 Characters', 'SHOW_FIRST_4', NULL, NULL),
       ('SHA-256 Hash', 'HASH_SHA256', NULL, NULL),
       ('Full Redaction', 'REDACT', '*', NULL),
       ('Email Mask', 'EMAIL_MASK', NULL, NULL),
       ('Phone Mask', 'PHONE_MASK', NULL, NULL),
       ('ID Card Mask', 'ID_CARD_MASK', NULL, NULL)
ON CONFLICT DO NOTHING;
