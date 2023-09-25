ALTER TABLE data_entity_filled 
RENAME COLUMN dataset_field_labels_filled TO dataset_field_tags_filled;

create TABLE IF NOT EXISTS tag_to_dataset_field
(
    tag_id     bigint NOT NULL,
    dataset_field_id bigint NOT NULL,
    origin     varchar(8) NOT NULL DEFAULT 'INTERNAL'::varchar,

    CONSTRAINT tag_to_dataset_field_pk PRIMARY KEY (tag_id, dataset_field_id),

    CONSTRAINT tag_to_dataset_field_fk_field FOREIGN KEY (dataset_field_id) REFERENCES dataset_field (id),
    CONSTRAINT tag_to_dataset_field_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tag (id)
);

insert into tag(name, important, created_at, updated_at)
select lbl.name, false, lbl.created_at, lbl.updated_at
from label lbl
where lbl.deleted_at is null
and not exists (select 1 from tag tg
			 where lower(tg.name) = lower(lbl.name));

insert into tag_to_dataset_field(tag_id, dataset_field_id, origin)
select tg.id, ltdsf.dataset_field_id, ltdsf.origin
from tag tg, label_to_dataset_field ltdsf, label lbl
where lower(tg.name) = lower(lbl.name)
and ltdsf.label_id = lbl.id;

UPDATE public.activity
SET old_state = old_state - 'labels' || jsonb_build_object('tags', old_state->'labels')
WHERE event_type = 'DATASET_FIELD_LABELS_UPDATED'
and old_state->>'labels' IS NOT NULL;

UPDATE public.activity
SET new_state = new_state - 'labels' || jsonb_build_object('tags', new_state->'labels')
WHERE event_type = 'DATASET_FIELD_LABELS_UPDATED'
and new_state->>'labels' IS NOT NULL;

UPDATE public.activity
SET old_state =
    CASE
        WHEN (old_state->'tags')::jsonb != '[]'::jsonb THEN
			JSONB_SET(
						old_state::jsonb,
						'{tags}',
						(
							SELECT jsonb_agg(
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
							FROM jsonb_array_elements(old_state->'tags') AS elem
							JOIN public.tag mapping ON LOWER(elem->>'name') = LOWER(mapping.name)
						)
					)
		ELSE
			old_state
    END
WHERE event_type = 'DATASET_FIELD_LABELS_UPDATED'
and old_state->>'tags' IS NOT NULL;

UPDATE public.activity
SET new_state =
    CASE
        WHEN (new_state->'tags')::jsonb != '[]'::jsonb THEN
			JSONB_SET(
						new_state::jsonb,
						'{tags}',
						(
							SELECT jsonb_agg(
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
							FROM jsonb_array_elements(new_state->'tags') AS elem
							JOIN public.tag mapping ON LOWER(elem->>'name') = LOWER(mapping.name)
						)
					)
		ELSE
			new_state
    END
WHERE event_type = 'DATASET_FIELD_LABELS_UPDATED'
and new_state->>'tags' IS NOT NULL;
