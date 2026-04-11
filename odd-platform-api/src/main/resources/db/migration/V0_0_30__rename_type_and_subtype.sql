ALTER TABLE data_entity
    RENAME COLUMN subtype_id TO type_id;
ALTER TABLE data_entity
    RENAME COLUMN type_ids TO entity_class_ids;