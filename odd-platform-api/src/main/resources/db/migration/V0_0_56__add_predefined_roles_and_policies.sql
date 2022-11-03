INSERT INTO policy(name, policy)
VALUES ('Administrator',
        '{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY"
      },
      "permissions": [
        "ALL"
      ]
    },
    {
      "resource": {
        "type": "TERM"
      },
      "permissions": [
        "ALL"
      ]
    },
    {
      "resource": {
        "type": "MANAGEMENT"
      },
      "permissions": [
        "ALL"
      ]
    }
  ]
}')
ON CONFLICT DO NOTHING;

INSERT INTO role(name)
VALUES ('Administrator'),
       ('User')
ON CONFLICT DO NOTHING;

INSERT INTO role_to_policy(role_id, policy_id)
VALUES ((SELECT id FROM role WHERE name = 'Administrator' AND deleted_at IS NULL),
        (SELECT id FROM policy WHERE name = 'Administrator' AND deleted_at IS NULL))
ON CONFLICT DO NOTHING;