INSERT INTO policy(name, policy)
VALUES ('DataSteward',
        '{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY"
      },
      "permissions": [
        "DATA_ENTITY_OWNERSHIP_CREATE",
        "DATA_ENTITY_OWNERSHIP_UPDATE",
        "DATA_ENTITY_OWNERSHIP_DELETE",
        "DATA_ENTITY_TAGS_UPDATE",
        "DATA_ENTITY_ADD_TERM",
        "DATA_ENTITY_DELETE_TERM",
        "DATA_ENTITY_DESCRIPTION_UPDATE",
        "DATA_ENTITY_STATUS_UPDATE",
        "DATA_ENTITY_CUSTOM_METADATA_CREATE",
        "DATA_ENTITY_CUSTOM_METADATA_UPDATE",
        "DATA_ENTITY_CUSTOM_METADATA_DELETE",
        "DATA_ENTITY_INTERNAL_NAME_UPDATE",
        "DATA_ENTITY_ATTACHMENT_MANAGE"
      ]
    },
    {
      "resource": {
        "type": "TERM"
      },
      "permissions": [
        "TERM_TAGS_UPDATE",
        "TERM_UPDATE"
      ]
    }
  ]
}')
ON CONFLICT DO NOTHING;

INSERT INTO policy(name, policy)
VALUES ('DataViewer',
        '{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY"
      },
      "permissions": []
    },
    {
      "resource": {
        "type": "TERM"
      },
      "permissions": []
    }
  ]
}')
ON CONFLICT DO NOTHING;

INSERT INTO policy(name, policy)
VALUES ('DataAnalyst',
        '{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY"
      },
      "permissions": [
        "DATA_ENTITY_CUSTOM_METADATA_CREATE",
        "DATA_ENTITY_CUSTOM_METADATA_UPDATE",
        "DATA_ENTITY_CUSTOM_METADATA_DELETE",
        "DATA_ENTITY_TAGS_UPDATE",
        "DATA_ENTITY_DESCRIPTION_UPDATE",
        "DATA_ENTITY_INTERNAL_NAME_UPDATE",
        "QUERY_EXAMPLE_DATASET_CREATE",
        "QUERY_EXAMPLE_DATASET_DELETE",
        "DATASET_FIELD_DESCRIPTION_UPDATE",
        "DATASET_FIELD_INTERNAL_NAME_UPDATE",
        "DATASET_FIELD_TAGS_UPDATE",
        "DATASET_FIELD_ENUMS_UPDATE",
        "DATASET_FIELD_ADD_TERM",
        "DATASET_FIELD_DELETE_TERM"
      ]
    },
    {
      "resource": {
        "type": "TERM"
      },
      "permissions": [
        "TERM_TAGS_UPDATE"
      ]
    }
  ]
}')
ON CONFLICT DO NOTHING;

INSERT INTO role(name)
VALUES ('DataSteward'),
       ('DataViewer'),
       ('DataAnalyst')
ON CONFLICT DO NOTHING;

INSERT INTO role_to_policy(role_id, policy_id)
VALUES ((SELECT id FROM role WHERE name = 'DataSteward' AND deleted_at IS NULL),
        (SELECT id FROM policy WHERE name = 'DataSteward' AND deleted_at IS NULL))
ON CONFLICT DO NOTHING;

INSERT INTO role_to_policy(role_id, policy_id)
VALUES ((SELECT id FROM role WHERE name = 'DataViewer' AND deleted_at IS NULL),
        (SELECT id FROM policy WHERE name = 'DataViewer' AND deleted_at IS NULL))
ON CONFLICT DO NOTHING;

INSERT INTO role_to_policy(role_id, policy_id)
VALUES ((SELECT id FROM role WHERE name = 'DataAnalyst' AND deleted_at IS NULL),
        (SELECT id FROM policy WHERE name = 'DataAnalyst' AND deleted_at IS NULL))
ON CONFLICT DO NOTHING;
