ALTER TABLE alert
    ADD COLUMN IF NOT EXISTS created_ats TIMESTAMP WITHOUT TIME ZONE[];

ALTER TABLE alert
    RENAME COLUMN created_at TO last_created_at;

ALTER TABLE alert
    ALTER COLUMN last_created_at SET NOT NULL;

UPDATE alert
SET created_ats = ARRAY [last_created_at];

UPDATE alert
SET messenger_entity_oddrn = NULL
WHERE type IN (1, 3, 4);

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
    messenger_entity_oddrn,
    json_agg(json_build_object('alert_id', alert.id, 'created_at', alert.last_created_at) order by alert.id) AS payload
FROM alert
GROUP BY messenger_entity_oddrn;

with alerts_to_update AS (
    SELECT
        payload->-1->>'alert_id' AS alert_id_to_update,
        json_array_elements(payload)->>'created_at' AS created_at
    FROM alert_temp
    WHERE json_array_length(payload) > 1
),
alerts_to_update_agg AS (
    SELECT
        alert_id_to_update::bigint,
        array_agg(created_at)::timestamp[] AS created_ats
    FROM alerts_to_update
    GROUP BY alert_id_to_update
)
UPDATE alert
SET created_ats = alerts_to_update_agg.created_ats
FROM alerts_to_update_agg
WHERE alert.id = alerts_to_update_agg.alert_id_to_update;

DELETE FROM alert
WHERE id in (
    SELECT
        (jsonb_array_elements(jsonb_path_query_array(payload::jsonb, '$[0 to LAST - 1]'))->'alert_id')::bigint
            AS alert_id_to_delete
    FROM alert_temp
    WHERE json_array_length(payload) > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS alert_unique ON alert (data_entity_oddrn, messenger_entity_oddrn)
    WHERE messenger_entity_oddrn IS NOT NULL;