ALTER TABLE data_entity_filled
    RENAME COLUMN dataset_field_labels_filled TO dataset_field_tags_filled;

UPDATE activity
SET event_type = 'DATASET_FIELD_TAGS_UPDATED'
WHERE event_type = 'DATASET_FIELD_LABELS_UPDATED';

CREATE TABLE IF NOT EXISTS tag_to_dataset_field
(
    tag_id           bigint  NOT NULL,
    dataset_field_id bigint  NOT NULL,
    origin           varchar NOT NULL DEFAULT 'INTERNAL'::varchar,

    CONSTRAINT tag_to_dataset_field_pk PRIMARY KEY (tag_id, dataset_field_id),

    CONSTRAINT tag_to_dataset_field_fk_field FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT tag_to_dataset_field_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tag (id)
);

INSERT INTO tag(name, important, created_at, updated_at)
SELECT lbl.name, false, lbl.created_at, lbl.updated_at
FROM label lbl
WHERE lbl.deleted_at IS NULL
  AND NOT EXISTS(SELECT 1
                 FROM tag tg
                 WHERE LOWER(tg.name) = LOWER(lbl.name));

INSERT INTO tag_to_dataset_field(tag_id, dataset_field_id, origin)
SELECT tg.id, ltdsf.dataset_field_id, ltdsf.origin
FROM tag tg,
     label_to_dataset_field ltdsf,
     label lbl
WHERE LOWER(tg.name) = LOWER(lbl.name)
  AND ltdsf.label_id = lbl.id;

UPDATE activity
SET old_state = old_state - 'labels' || jsonb_build_object('tags', old_state -> 'labels')
WHERE event_type = 'DATASET_FIELD_TAGS_UPDATED'
  AND old_state ->> 'labels' IS NOT NULL;

UPDATE activity
SET new_state = new_state - 'labels' || jsonb_build_object('tags', new_state -> 'labels')
WHERE event_type = 'DATASET_FIELD_TAGS_UPDATED'
  AND new_state ->> 'labels' IS NOT NULL;

UPDATE activity
SET old_state =
        CASE
            WHEN (old_state -> 'tags')::jsonb != '[]'::jsonb THEN
                JSONB_SET(
                        old_state::jsonb,
                        '{tags}',
                        (SELECT jsonb_agg(
                                        jsonb_set(
                                                jsonb_set(
                                                        elem,
                                                        '{id}',
                                                        to_jsonb(mapping.id)::jsonb
                                                    ),
                                                '{name}',
                                                to_jsonb(mapping.name)::jsonb
                                            )
                                    )
                         FROM jsonb_array_elements(old_state -> 'tags') AS elem
                                  JOIN tag mapping ON LOWER(elem ->> 'name') = LOWER(mapping.name))
                    )
            ELSE
                old_state
            END
WHERE event_type = 'DATASET_FIELD_TAGS_UPDATED'
  AND old_state ->> 'tags' IS NOT NULL;

UPDATE activity
SET new_state =
        CASE
            WHEN (new_state -> 'tags')::jsonb != '[]'::jsonb THEN
                JSONB_SET(
                        new_state::jsonb,
                        '{tags}',
                        (SELECT jsonb_agg(
                                        jsonb_set(
                                                jsonb_set(
                                                        elem,
                                                        '{id}',
                                                        to_jsonb(mapping.id)::jsonb
                                                    ),
                                                '{name}',
                                                to_jsonb(mapping.name)::jsonb
                                            )
                                    )
                         FROM jsonb_array_elements(new_state -> 'tags') AS elem
                                  JOIN tag mapping ON LOWER(elem ->> 'name') = LOWER(mapping.name))
                    )
            ELSE
                new_state
            END
WHERE event_type = 'DATASET_FIELD_TAGS_UPDATED'
  AND new_state ->> 'tags' IS NOT NULL;
