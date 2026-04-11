ALTER TABLE data_entity_statistics
    RENAME COLUMN data_entity_classes_count TO data_entity_classes_types_count;

WITH entity_type_split AS (SELECT unnest(entity_class_ids) AS classes, type_id AS type, count(distinct id)
                           FROM data_entity
                           WHERE hollow = false
                             and (exclude_from_search = false or exclude_from_search is null)
                             and deleted_at is null
                           GROUP BY classes, type_id),
     entity_class_split AS (SELECT classes,
                                   json_object_agg(entity_type_split.type, entity_type_split.count)::jsonb AS json_count
                            FROM entity_type_split
                            GROUP BY classes),
     classes_types_count AS (SELECT json_object_agg(classes, json_count) as count
                             FROM entity_class_split)
UPDATE data_entity_statistics
SET data_entity_classes_types_count = (SELECT count from classes_types_count);