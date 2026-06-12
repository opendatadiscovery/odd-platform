CREATE TABLE IF NOT EXISTS query_example_to_term
(
    query_example_id      bigint NOT NULL,
    term_id               bigint NOT NULL,
    is_description_link boolean DEFAULT FALSE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT query_example_pk PRIMARY KEY (query_example_id, term_id),

    CONSTRAINT query_example_to_term_query_example_id_fkey FOREIGN KEY (query_example_id) REFERENCES query_example (id),
    CONSTRAINT query_example_term_id_fkey FOREIGN KEY (term_id) REFERENCES term (id)
);