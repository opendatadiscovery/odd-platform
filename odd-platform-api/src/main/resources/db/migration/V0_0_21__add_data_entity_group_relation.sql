CREATE TABLE IF NOT EXISTS group_entity_relations
(
    group_oddrn       varchar,
    data_entity_oddrn varchar,

    CONSTRAINT group_entity_relations_pk PRIMARY KEY (group_oddrn, data_entity_oddrn),

    CONSTRAINT group_entity_relations_fk_group FOREIGN KEY (group_oddrn) REFERENCES data_entity (oddrn),
    CONSTRAINT group_entity_relations_fk_entity FOREIGN KEY (data_entity_oddrn) REFERENCES data_entity (oddrn)
);

CREATE TABLE IF NOT EXISTS group_parent_group_relations
(
    group_oddrn       varchar,
    parent_group_oddrn varchar,

    CONSTRAINT group_parent_group_relations_pk PRIMARY KEY (group_oddrn, parent_group_oddrn),

    CONSTRAINT group_parent_group_relations_fk_group FOREIGN KEY (group_oddrn) REFERENCES data_entity (oddrn),
    CONSTRAINT group_parent_group_relations_fk_parent_group FOREIGN KEY (parent_group_oddrn) REFERENCES data_entity (oddrn)
);

ALTER TABLE data_entity ADD COLUMN IF NOT EXISTS exclude_from_search boolean DEFAULT FALSE;

UPDATE data_entity SET exclude_from_search = hollow;