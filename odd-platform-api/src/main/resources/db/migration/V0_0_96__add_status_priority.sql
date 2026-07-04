-- CTRIB-053 / #1836 ST-2a — index-backed status-priority browse ordering (Closes #1705).
--
-- #1705's status-priority browse default already ships (an inline CASE in
-- ReactiveDataEntityRepositoryImpl.findByState, from PR #1707) but is NOT index-backed —
-- a sort node on the most-run browse query. This denormalises the status→priority order
-- (STABLE first) into a btree-indexed column so the browse sort is index-backed at scale.
-- ST-4 later extends this column onto the unified search index.
--
-- Maintained DB-side by a trigger (this repo's first — deliberate: a derived column that a
-- future application write-path can never forget to update, unlike hand-maintenance at the
-- ~5 status-write sites; a plain smallint keeps it jOOQ-transparent and the nullable ADD +
-- backfill keeps the 1.0.0 upgrade migration rewrite-free, unlike a GENERATED STORED column).
--
-- Priority (STABLE-first — same relative order as the retired inline CASE; DataEntityStatusDto
-- ids: UNASSIGNED=1, DRAFT=2, STABLE=3, DEPRECATED=4, DELETED=5):
--   STABLE(3)->0, DEPRECATED(4)->1, DRAFT(2)->2, UNASSIGNED(1)->3, DELETED(5)->4

-- The single source of truth for the status->priority mapping (reused by the backfill + the trigger).
CREATE OR REPLACE FUNCTION data_entity_status_priority(entity_status SMALLINT)
    RETURNS SMALLINT
    LANGUAGE SQL
    IMMUTABLE
AS $$
    SELECT CASE entity_status
        WHEN 3 THEN 0  -- STABLE
        WHEN 4 THEN 1  -- DEPRECATED
        WHEN 2 THEN 2  -- DRAFT
        WHEN 1 THEN 3  -- UNASSIGNED
        WHEN 5 THEN 4  -- DELETED
        ELSE 3         -- unknown -> UNASSIGNED-priority (defensive)
    END::SMALLINT
$$;

-- Rewrite-free add (nullable), then backfill existing rows from their current status.
ALTER TABLE data_entity
    ADD COLUMN IF NOT EXISTS status_priority SMALLINT;

UPDATE data_entity
SET status_priority = data_entity_status_priority(status)
WHERE status_priority IS NULL;

ALTER TABLE data_entity
    ALTER COLUMN status_priority SET DEFAULT 3,
    ALTER COLUMN status_priority SET NOT NULL;

-- Keep status_priority in lockstep with status on every write. Scoped to `UPDATE OF status`
-- so the view_count-increment hot path (a targeted UPDATE that never touches status) pays
-- nothing; the BEFORE trigger runs before the NOT NULL check so an INSERT need not supply it.
CREATE OR REPLACE FUNCTION data_entity_set_status_priority()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.status_priority := data_entity_status_priority(NEW.status);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS data_entity_status_priority_trg ON data_entity;
CREATE TRIGGER data_entity_status_priority_trg
    BEFORE INSERT OR UPDATE OF status ON data_entity
    FOR EACH ROW
    EXECUTE FUNCTION data_entity_set_status_priority();

CREATE INDEX IF NOT EXISTS data_entity_status_priority_idx
    ON data_entity (status_priority);
