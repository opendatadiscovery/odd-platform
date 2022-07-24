CREATE TABLE IF NOT EXISTS data_entity_statistics
(
    total_count               BIGINT NOT NULL DEFAULT 0,
    data_entity_classes_count jsonb
);

CREATE TABLE IF NOT EXISTS data_entity_filled
(
    data_entity_id                   BIGINT PRIMARY KEY,
    internal_name_filled             BOOLEAN NOT NULL DEFAULT FALSE,
    internal_description_filled      BOOLEAN NOT NULL DEFAULT FALSE,
    internal_metadata_filled         BOOLEAN NOT NULL DEFAULT FALSE,
    owners_filled                    BOOLEAN NOT NULL DEFAULT FALSE,
    custom_group_filled              BOOLEAN NOT NULL DEFAULT FALSE,
    internal_tags_filled             BOOLEAN NOT NULL DEFAULT FALSE,
    terms_filled                     BOOLEAN NOT NULL DEFAULT FALSE,
    dataset_field_description_filled BOOLEAN NOT NULL DEFAULT FALSE,
    dataset_field_labels_filled      BOOLEAN NOT NULL DEFAULT FALSE,
    dataset_field_enums_filled       BOOLEAN NOT NULL DEFAULT FALSE,
    manually_created                 BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT data_entity_filled_fk FOREIGN KEY (data_entity_id) REFERENCES data_entity (id)
);

INSERT INTO data_entity_statistics(total_count, data_entity_classes_count)
with total_count as (select count(distinct id) as count
                     from data_entity
                     where hollow = false
                       and (exclude_from_search = false or exclude_from_search is null)
                       and deleted_at is null),
     entity_class_json as (with entity_class_split
                                    as (select unnest(entity_class_ids) as classes, count(distinct id) as count
                                        from data_entity
                                        where hollow = false
                                          and (exclude_from_search = false or exclude_from_search is null)
                                          and deleted_at is null
                                        group by classes)
                           select json_object_agg(entity_class_split.classes,
                                                  entity_class_split.count)::jsonb as json_count
                           from entity_class_split)

SELECT total_count.count            as total,
       entity_class_json.json_count as classes
FROM total_count,
     entity_class_json;

INSERT INTO data_entity_filled(data_entity_id, internal_name_filled, internal_description_filled,
                               internal_metadata_filled, owners_filled, custom_group_filled,
                               internal_tags_filled, terms_filled, dataset_field_description_filled,
                               dataset_field_enums_filled, dataset_field_labels_filled, manually_created)
select distinct data_en.id,
                (data_en.internal_name is not null and data_en.internal_name <> '')       as internal_name_exists,
                (internal_description is not null and data_en.internal_description <> '') as internal_description_exists,
                exists(select 1
                       from metadata_field_value mfv
                                join metadata_field mf on mfv.metadata_field_id = mf.id
                       where mf.origin = 'INTERNAL'
                         and mfv.data_entity_id = data_en.id)                             as metadata_exists,
                exists(select 1
                       from ownership o
                       where o.data_entity_id = data_en.id)                               as ownership_exists,
                exists(select 1
                       from group_entity_relations ger
                                join data_entity de on ger.group_oddrn = de.oddrn
                       where de.manually_created is true
                         and data_en.oddrn = ger.data_entity_oddrn)                       as parent_group_exists,
                exists(
                        select 1
                        from tag_to_data_entity tde
                        where external is false
                          and tde.data_entity_id = data_en.id
                    )                                                                     as tag_exists,
                exists(
                        select 1
                        from data_entity_to_term det
                        where det.data_entity_id = data_en.id
                    )                                                                     as term_exists,
                exists(
                        select 1
                        from data_entity de
                                 join dataset_version on de.oddrn = dataset_version.dataset_oddrn
                                 join dataset_structure ds on dataset_version.id = ds.dataset_version_id
                                 join dataset_field df on ds.dataset_field_id = df.id
                        where (df.internal_description is not null and df.internal_description <> '')
                          and de.id = data_en.id
                    )                                                                     as dataset_field_description_exists,
                exists(
                        select 1
                        from data_entity de
                                 join dataset_version on de.oddrn = dataset_version.dataset_oddrn
                                 join dataset_structure ds on dataset_version.id = ds.dataset_version_id
                                 join dataset_field df on ds.dataset_field_id = df.id
                        where df.id in (select dataset_field_id from enum_value ev)
                          and de.id = data_en.id
                    )                                                                     as dataset_field_enums_exists,
                exists(
                        select 1
                        from data_entity de
                                 join dataset_version on de.oddrn = dataset_version.dataset_oddrn
                                 join dataset_structure ds on dataset_version.id = ds.dataset_version_id
                                 join dataset_field df on ds.dataset_field_id = df.id
                        where df.id in
                              (select distinct(dataset_field_id) from label_to_dataset_field where external is false)
                          and de.id = data_en.id
                    )                                                                     as dataset_field_labels_exists,
                data_en.manually_created
from data_entity data_en
where data_en.hollow = false
  and (data_en.exclude_from_search = false or data_en.exclude_from_search is null)
  and data_en.deleted_at is null
  and (
        (data_en.internal_name is not null and data_en.internal_name <> '')
        or (data_en.internal_description is not null and internal_description <> '')
        or data_en.manually_created is true
        or data_en.id in (select distinct (mfv.data_entity_id)
                          from metadata_field_value mfv
                                   join metadata_field mf on mfv.metadata_field_id = mf.id
                          where mf.origin = 'INTERNAL')
        or data_en.id in (select distinct(data_entity_id) from ownership)
        or data_en.oddrn in (select distinct(data_entity_oddrn)
                             from group_entity_relations
                                      join data_entity de on group_entity_relations.group_oddrn = de.oddrn
                             where de.manually_created is true)
        or data_en.id in (select distinct(data_entity_id) from tag_to_data_entity where external is false)
        or data_en.id in (select data_entity_id from data_entity_to_term)
        or data_en.id in (select de.id
                          from data_entity de
                                   join dataset_version on de.oddrn = dataset_version.dataset_oddrn
                                   join dataset_structure ds on dataset_version.id = ds.dataset_version_id
                                   join dataset_field df on ds.dataset_field_id = df.id
                          where (df.internal_description is not null and df.internal_description <> '')
                             or df.id in
                                (select dataset_field_id from enum_value ev)
                             or df.id in
                                (select distinct(dataset_field_id)
                                 from label_to_dataset_field
                                 where external is false)));