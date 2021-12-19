ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS type_ids integer[],
    ALTER COLUMN subtype_id TYPE integer,
    DROP CONSTRAINT data_entity_fk_subtype;

WITH cte AS (
    SELECT
        data_entity.id as data_entity_id,
        array_agg(data_entity_type.id) as types
    FROM data_entity
    LEFT JOIN type_entity_relation ON type_entity_relation.data_entity_id = data_entity.id
    LEFT JOIN data_entity_type ON data_entity_type.id = type_entity_relation.data_entity_type_id
    WHERE data_entity.hollow != True
    GROUP BY data_entity.id
)
UPDATE data_entity SET type_ids=cte.types
FROM cte
WHERE data_entity.id = cte.data_entity_id;

DROP TABLE type_entity_relation;
DROP TABLE type_subtype_relation;
DROP TABLE data_entity_type;
DROP TABLE data_entity_subtype;

CREATE INDEX data_entity_type_ids ON data_entity USING GIN (type_ids);