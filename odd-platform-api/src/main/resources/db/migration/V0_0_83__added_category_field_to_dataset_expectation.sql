UPDATE data_entity
SET specific_attributes = jsonb_set(
    specific_attributes,
    '{DATA_QUALITY_TEST,expectation,category}',
    '"ASSERTION"',
    true
)
WHERE type_id = 5
and specific_attributes->'DATA_QUALITY_TEST'->'expectation' is not null;