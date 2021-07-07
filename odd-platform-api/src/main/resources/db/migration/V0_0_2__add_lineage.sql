CREATE TABLE IF NOT EXISTS lineage
(
    parent_oddrn varchar(512),
    child_oddrn  varchar(512),

    CONSTRAINT lineage_pk PRIMARY KEY (parent_oddrn, child_oddrn)
);

ALTER TABLE data_entity
    ADD hollow BOOLEAN NOT NULL DEFAULT FALSE;