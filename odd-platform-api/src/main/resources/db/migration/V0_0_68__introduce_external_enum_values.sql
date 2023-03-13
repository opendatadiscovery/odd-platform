ALTER TABLE enum_value
    ADD COLUMN origin               SMALLINT,
    ADD COLUMN internal_description VARCHAR,
    ADD COLUMN external_description VARCHAR;

UPDATE enum_value
SET origin               = 1,
    internal_description = description;

ALTER TABLE enum_value
    ALTER COLUMN origin SET NOT NULL,
    DROP COLUMN description;