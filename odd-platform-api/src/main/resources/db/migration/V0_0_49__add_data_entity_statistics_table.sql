CREATE TABLE IF NOT EXISTS data_entity_statistics
(
    total_count               BIGINT NOT NULL DEFAULT 0,
    data_entity_classes_count jsonb
);

CREATE TABLE IF NOT EXISTS data_entity_filled
(
    data_entity_id BIGINT PRIMARY KEY,
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

INSERT INTO data_entity_filled(data_entity_id)
select distinct id
from data_entity
where hollow = false
  and (exclude_from_search = false or exclude_from_search is null)
  and deleted_at is null
  and (internal_name is not null
    or internal_description is not null
    or manually_created is true
    or id in (select distinct (mfv.data_entity_id)
              from metadata_field_value mfv
                       join metadata_field mf on mfv.metadata_field_id = mf.id
              where mf.origin = 'INTERNAL')
    or id in (select distinct(data_entity_id) from ownership)
    or oddrn in (select distinct(data_entity_oddrn)
                 from group_entity_relations
                          join data_entity de on group_entity_relations.group_oddrn = de.oddrn
                 where de.manually_created is true)
    or id in (select distinct(data_entity_id) from tag_to_data_entity where external is false)
    or id in (select data_entity_id from data_entity_to_term)
    or id in (select de.id
              from data_entity de
                       join dataset_version on de.oddrn = dataset_version.dataset_oddrn
                       join dataset_structure ds on dataset_version.id = ds.dataset_version_id
                       join dataset_field df on ds.dataset_field_id = df.id
              where df.internal_description is not null
                 or df.id in
                    (select dataset_field_id from enum_value ev)
                 or df.id in (select distinct(dataset_field_id) from label_to_dataset_field where external is false)));