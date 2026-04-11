ALTER TABLE role
    RENAME TO title;

ALTER TABLE ownership
    RENAME COLUMN role_id TO title_id;

ALTER TABLE term_ownership
    RENAME COLUMN role_id TO title_id;

ALTER TABLE ownership
    RENAME CONSTRAINT ownership_fk_role TO ownership_fk_title;

ALTER TABLE term_ownership
    RENAME CONSTRAINT term_ownership_fk_role TO term_ownership_fk_title;

ALTER SEQUENCE role_id_seq RENAME TO title_id_seq;

UPDATE activity
SET old_state = (REPLACE(old_state::TEXT, '"role_name"', '"title_name"'))::JSONB
WHERE event_type IN ('OWNERSHIP_CREATED', 'OWNERSHIP_UPDATED', 'OWNERSHIP_DELETED');

UPDATE activity
SET new_state = (REPLACE(new_state::TEXT, '"role_name"', '"title_name"'))::JSONB
WHERE event_type IN ('OWNERSHIP_CREATED', 'OWNERSHIP_UPDATED', 'OWNERSHIP_DELETED');