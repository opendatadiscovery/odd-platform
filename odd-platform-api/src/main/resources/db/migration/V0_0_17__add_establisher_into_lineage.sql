ALTER TABLE lineage
    ADD COLUMN establisher_oddrn varchar,
    DROP CONSTRAINT lineage_pk;

WITH cte AS (
    SELECT
        DISTINCT (parent_oddrn)                                     AS parent_oddrn,
        de.specific_attributes #> '{DATA_TRANSFORMER, target_list}' AS targets_jsonb,
        det.name
    FROM lineage
    JOIN data_entity de ON lineage.parent_oddrn = de.oddrn
    JOIN type_entity_relation ter ON de.id = ter.data_entity_id
    JOIN data_entity_type det ON ter.data_entity_type_id = det.id
    WHERE det.name = 'DATA_TRANSFORMER'
),
processing AS (
    SELECT
       cte.parent_oddrn,
       jsonb_array_elements(cte.targets_jsonb) #>> '{}' AS child_oddrn,
       cte.parent_oddrn                                 AS establisher_oddrn
    FROM cte
    WHERE cte.targets_jsonb is NOT NULL AND jsonb_array_length(cte.targets_jsonb) != 0
)
INSERT INTO lineage
SELECT * FROM processing;

WITH cte AS (
    SELECT
        DISTINCT(child_oddrn)                                       AS child_oddrn,
        de.specific_attributes #> '{DATA_TRANSFORMER, source_list}' AS sources_jsonb,
        det.name
    FROM lineage
    JOIN data_entity de ON lineage.child_oddrn = de.oddrn
    JOIN type_entity_relation ter ON de.id = ter.data_entity_id
    JOIN data_entity_type det ON ter.data_entity_type_id = det.id
    WHERE det.name = 'DATA_TRANSFORMER'
),
processing AS (
    SELECT
       jsonb_array_elements(cte.sources_jsonb) #>> '{}' AS parent_oddrn,
       cte.child_oddrn,
       cte.child_oddrn                                  AS establisher_oddrn
    FROM cte
    WHERE cte.sources_jsonb is NOT NULL AND jsonb_array_length(cte.sources_jsonb) != 0
)
INSERT INTO lineage
SELECT * FROM processing;

WITH cte AS (
    SELECT
        DISTINCT(child_oddrn)                                   AS child_oddrn,
        de.specific_attributes #> '{DATA_CONSUMER, input_list}' AS inputs_jsonb,
        det.name
    FROM lineage
    JOIN data_entity de ON lineage.child_oddrn = de.oddrn
    JOIN type_entity_relation ter ON de.id = ter.data_entity_id
    JOIN data_entity_type det ON ter.data_entity_type_id = det.id
    WHERE det.name = 'DATA_CONSUMER'
),
processing AS (
    SELECT
       jsonb_array_elements(cte.inputs_jsonb) #>> '{}' AS parent_oddrn,
       cte.child_oddrn,
       cte.child_oddrn                                 AS establisher_oddrn
    FROM cte
    WHERE cte.inputs_jsonb IS NOT NULL AND jsonb_array_length(cte.inputs_jsonb) != 0
)
INSERT INTO lineage
SELECT * FROM processing;

CREATE TEMPORARY TABLE dataset_links
(
    parent_oddrn      VARCHAR,
    child_oddrn       VARCHAR,
    establisher_oddrn VARCHAR,
    establisher_sa    JSONB
);

WITH cte AS (
    SELECT
        lineage.parent_oddrn,
        lineage.child_oddrn,
        lineage.child_oddrn          AS establisher_oddrn,
        de_child.specific_attributes AS establisher_sa
    FROM lineage
    JOIN data_entity de_parent ON lineage.parent_oddrn = de_parent.oddrn
    JOIN data_entity de_child ON lineage.child_oddrn = de_child.oddrn
    WHERE de_child.specific_attributes ? 'DATA_SET'
    AND (
        NOT de_child.specific_attributes ? 'DATA_TRANSFORMER' or
        NOT de_child.specific_attributes #> '{DATA_TRANSFORMER, source_list}' ? lineage.parent_oddrn
    )
    AND (
        NOT de_parent.specific_attributes ? 'DATA_TRANSFORMER' or
        NOT de_parent.specific_attributes #> '{DATA_TRANSFORMER, target_list}' ? lineage.parent_oddrn
    )
    AND (
        NOT de_child.specific_attributes ? 'DATA_CONSUMER' or
        NOT de_child.specific_attributes #> '{DATA_CONSUMER, input_list}' ? lineage.parent_oddrn
    )
)
INSERT INTO dataset_links
SELECT * FROM cte;

UPDATE data_entity
SET specific_attributes = jsonb_set(dl.establisher_sa, '{DATA_SET, parent_oddrn}', ('"' || dl.parent_oddrn || '"')::jsonb)
FROM (SELECT * FROM dataset_links) AS dl
WHERE oddrn = dl.establisher_oddrn;

INSERT INTO lineage
SELECT parent_oddrn, child_oddrn, establisher_oddrn FROM dataset_links;

DELETE FROM lineage
WHERE establisher_oddrn IS NULL;

ALTER TABLE lineage
    ADD PRIMARY KEY (parent_oddrn, child_oddrn, establisher_oddrn);

CREATE INDEX lineage_establisher_oddrn ON lineage (establisher_oddrn);