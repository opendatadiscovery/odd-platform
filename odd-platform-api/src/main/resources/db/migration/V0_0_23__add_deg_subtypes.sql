INSERT INTO data_entity_subtype(name)
VALUES ('DATABASE_SERVICE'),
       ('API_SERVICE'),
       ('KAFKA_SERVICE') ON CONFLICT DO NOTHING;

INSERT INTO type_subtype_relation(type_id, subtype_id)
VALUES ((SELECT id FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT id FROM data_entity_subtype WHERE name = 'DATABASE_SERVICE')),
       ((SELECT id FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT id FROM data_entity_subtype WHERE name = 'API_SERVICE')),
       ((SELECT id FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT id FROM data_entity_subtype WHERE name = 'KAFKA_SERVICE')) ON CONFLICT DO NOTHING;