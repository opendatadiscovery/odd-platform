ALTER TABLE alert
    ADD COLUMN IF NOT EXISTS status_updated_by varchar;