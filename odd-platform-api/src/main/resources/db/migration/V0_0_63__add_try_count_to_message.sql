ALTER TABLE IF EXISTS message
    ADD COLUMN IF NOT EXISTS try_send_count smallint NULL;