INSERT INTO data_entity_subtype(name)
VALUES ('DATABASE_SERVICE'),
       ('API_SERVICE'),
       ('KAFKA_SERVICE') ON CONFLICT DO NOTHING;

INSERT INTO type_subtype_relation(type_id, subtype_id)
VALUES ((SELECT * FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT * FROM data_entity_subtype WHERE name = 'DATABASE_SERVICE')),
       ((SELECT * FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT * FROM data_entity_subtype WHERE name = 'API_SERVICE')),
       ((SELECT * FROM data_entity_type WHERE name = 'DATA_ENTITY_GROUP'),
        (SELECT * FROM data_entity_subtype WHERE name = 'KAFKA_SERVICE')) ON CONFLICT DO NOTHING;