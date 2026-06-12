CREATE TABLE IF NOT EXISTS term_to_term
(
    target_term_id      bigint NOT NULL,
    assigned_term_id    bigint NOT NULL,
    is_description_link boolean DEFAULT FALSE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT term_to_term_pk PRIMARY KEY (target_term_id, assigned_term_id),

    CONSTRAINT term_to_term_target_term_id_fkey FOREIGN KEY (target_term_id) REFERENCES term (id),
    CONSTRAINT term_to_term_assigned_term_id_fkey FOREIGN KEY (assigned_term_id) REFERENCES term (id)
);

CREATE TABLE IF NOT EXISTS term_definition_unhandled_term
(
    id                  BIGSERIAL PRIMARY KEY,
    target_term_id      BIGINT                      NOT NULL,
    term_name           varchar(255)                NOT NULL,
    term_namespace_name varchar(64)                 NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE ('UTC')),

    CONSTRAINT fk_term_definition_unhandled_term_target_term_id FOREIGN KEY (target_term_id) REFERENCES term (id),
    CONSTRAINT term_definition_unhandled_term_unique_key UNIQUE (target_term_id, term_name, term_namespace_name)
);