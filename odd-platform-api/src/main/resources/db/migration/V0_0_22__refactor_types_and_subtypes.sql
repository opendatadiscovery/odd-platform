INSERT INTO data_entity_type (name)
VALUES ('DATA_ENTITY_GROUP') ON CONFLICT DO NOTHING;

INSERT INTO data_entity_subtype(name)
VALUES ('DAG'),
       ('GRAPH_NODE') ON CONFLICT DO NOTHING;

UPDATE data_entity_subtype
set name='ML_EXPERIMENT'
where name = 'EXPERIMENT';

DELETE
FROM type_subtype_relation
WHERE subtype_id =
      (SELECT id from data_entity_subtype WHERE name = 'ML_EXPERIMENT');

INSERT INTO type_subtype_relation(type_id, subtype_id)
VALUES ((SELECT id from data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT id from data_entity_subtype WHERE name = 'ML_EXPERIMENT')),
       ((SELECT id from data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT id from data_entity_subtype WHERE name = 'DAG')),
       ((SELECT id from data_entity_type WHERE name = 'DATA_SET'),
        (SELECT id from data_entity_subtype WHERE name = 'GRAPH_NODE')) ON CONFLICT DO NOTHING;