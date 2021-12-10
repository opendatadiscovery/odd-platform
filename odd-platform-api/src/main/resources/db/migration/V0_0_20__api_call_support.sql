INSERT INTO data_entity_subtype (name)
VALUES ('API_CALL');

INSERT INTO type_subtype_relation (type_id, subtype_id)
VALUES (
    (SELECT id FROM data_entity_type WHERE name = 'DATA_INPUT'),
    (SELECT id FROM data_entity_subtype WHERE name = 'API_CALL')
)