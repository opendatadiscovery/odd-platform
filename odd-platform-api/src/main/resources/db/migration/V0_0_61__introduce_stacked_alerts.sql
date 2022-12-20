ALTER TABLE alert
    RENAME COLUMN created_at TO last_created_at;

UPDATE alert
SET messenger_entity_oddrn = NULL
WHERE type IN (1, 3, 4);

CREATE TABLE IF NOT EXISTS alert_chunk
(
    alert_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    description TEXT,

    CONSTRAINT alert_chunk_fk FOREIGN KEY (alert_id) REFERENCES alert (id)
);

WITH cte AS (
    SELECT
        a.id AS alert_id,
        detr.task_oddrn AS new_messenger_oddrn
    FROM data_entity_task_run AS detr
    JOIN data_quality_test_relations dqtr on dqtr.data_quality_test_oddrn = detr.task_oddrn
    JOIN alert a on a.messenger_entity_oddrn = detr.oddrn
)
UPDATE alert
SET messenger_entity_oddrn = cte.new_messenger_oddrn
FROM cte
WHERE alert.id = cte.alert_id;

CREATE TEMPORARY TABLE alert_temp ON COMMIT DROP AS
SELECT
    json_agg(json_build_object(
        'alert_id', alert.id,
        'created_at', alert.last_created_at,
        'description', alert.description
    ) order by alert.id) AS payload
FROM alert
WHERE alert.type = 2
GROUP BY messenger_entity_oddrn
UNION ALL
SELECT
    json_agg(json_build_object(
        'alert_id', alert.id,
        'created_at', alert.last_created_at,
        'description', alert.description
    ) order by alert.id) AS payload
FROM alert
WHERE alert.type != 2
GROUP BY data_entity_oddrn, type;

WITH cte AS (
    SELECT
        payload->-1->>'alert_id' AS alert_id,
        json_array_elements(payload) AS payload
    FROM alert_temp
    WHERE json_array_length(payload) > 1
)
INSERT INTO alert_chunk (alert_id, created_at, description)
SELECT cte.alert_id::bigint, (cte.payload->>'created_at')::timestamp, cte.payload->>'description'
FROM cte;

DELETE FROM alert
WHERE id in (
    SELECT
        (jsonb_array_elements(jsonb_path_query_array(payload::jsonb, '$[0 to LAST - 1]'))->'alert_id')::bigint
            AS alert_id_to_delete
    FROM alert_temp
    WHERE json_array_length(payload) > 1
);

ALTER TABLE alert
    DROP COLUMN IF EXISTS description;

CREATE UNIQUE INDEX IF NOT EXISTS alert_unique_messenger_oddrn_is_present ON alert (data_entity_oddrn, type, messenger_entity_oddrn)
    WHERE messenger_entity_oddrn IS NOT NULL
    AND status = 1;

CREATE UNIQUE INDEX IF NOT EXISTS alert_unique_messenger_oddrn_is_missing ON alert (data_entity_oddrn, type)
    WHERE messenger_entity_oddrn IS NULL
    AND status = 1;