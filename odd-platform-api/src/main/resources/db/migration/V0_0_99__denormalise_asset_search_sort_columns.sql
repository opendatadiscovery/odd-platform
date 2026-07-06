-- CTRIB-057 / #1839 ST-5a — index-backed cross-kind browse sort on asset_search_entrypoint.
--
-- ST-4 (V0_0_98) built the unified index carrying ONLY the FTS search_vector and resolved every sort
-- key by coalesce() over LEFT-JOINed base tables (data_entity / term / query_example). That ORDER BY
-- cannot be served by any index, so the planner materialises + Sorts — the at-scale browse cost ST-4
-- explicitly deferred to ST-5 (ReactiveAssetSearchRepositoryImpl "the at-scale index/keyset hardening
-- of this ordering is deferred (ST-5)").
--
-- This migration DENORMALISES the three currently-exposed sort keys (status_priority, updated_at, name)
-- onto asset_search_entrypoint and adds NULLS-aligned composite btree indexes that carry the
-- (asset_kind ASC, asset_id DESC) tiebreaker, so the common browse sorts become an ordered Index Scan
-- with NO Sort node (verified by EXPLAIN before commit — CTRIB-057 Phase-D spike). It is the deliberate,
-- ADR-sanctioned inverse of V0_0_98's "never denormalise sort data that would drift" note: the drift is
-- prevented by the SAME trigger mechanism V0_0_98 uses for search_vector (ADR unified-asset-search D2/D12,
-- and V0_0_96's own "ST-4 later extends this column onto the unified search index").
--
-- Scope (ST-5a): ONLY the index-backed sort. Keyset pagination (5b) and popularity_score (5c) are separate
-- slices. Read-time ELIGIBILITY (hollow / exclude_from_search / status=DELETED for DE; deleted_at for
-- Term/QE) is NOT denormalised — it stays a post-join filter in the ranked query, so no eligibility drift
-- surface is introduced (the ordered-index-driven nested loop applies it as a filter before LIMIT).
--
-- Maintenance (drift prevention), two complementary paths:
--   (1) The V0_0_98 per-entrypoint sync functions are EXTENDED to also populate the sort columns from the
--       base row (so a fresh entity's union row is created WITH its sort values, not NULL-until-next-write).
--   (2) NEW AFTER-trigger(s) on the base tables catch sort-field changes that do NOT rewrite the FTS vector
--       (a status change, a rename, a source_updated_at bump). Scoped `UPDATE OF` so the view_count-increment
--       hot path (which touches none of these columns) pays nothing — the V0_0_96 discipline.

-- ---------------------------------------------------------------------------------------------------------
-- Columns (nullable add; status_priority tightened to NOT NULL DEFAULT 3 after backfill so the ORDER BY is
-- a bare column with no coalesce() wrapper — a coalesce() in the ORDER BY does NOT match a plain-column
-- btree and reintroduces the Sort node, per the Phase-D EXPLAIN spike). updated_at / name stay nullable
-- (Query Examples have no name; non-DE updated_at can be null) and use NULLS-LAST indexes.
-- ---------------------------------------------------------------------------------------------------------
ALTER TABLE asset_search_entrypoint
    ADD COLUMN IF NOT EXISTS status_priority smallint,
    ADD COLUMN IF NOT EXISTS updated_at      timestamp without time zone,
    ADD COLUMN IF NOT EXISTS name            text;

-- ---------------------------------------------------------------------------------------------------------
-- Backfill the existing union rows (ST-4 already backfilled asset_kind/asset_id/search_vector). Sort keys
-- mirror ReactiveAssetSearchRepositoryImpl's ST-4 sort expressions EXACTLY (parity):
--   status_priority: DE -> data_entity.status_priority; non-DE -> 3 (the ST-4 NON_DE_STATUS_PRIORITY fold).
--   updated_at:      DE -> source_updated_at; Term/QE -> updated_at.
--   name:            DE -> coalesce(internal_name, external_name); Term -> name; QE -> NULL (QE has no name).
-- name is stored RAW; the index + ORDER BY apply lower() so the ordering is byte-identical to ST-4's
-- lower(coalesce(...)).
-- ---------------------------------------------------------------------------------------------------------
UPDATE asset_search_entrypoint a
SET status_priority = de.status_priority,
    updated_at      = de.source_updated_at,
    name            = coalesce(de.internal_name, de.external_name)
FROM data_entity de
WHERE a.asset_kind = 'DATA_ENTITY' AND a.asset_id = de.id;

UPDATE asset_search_entrypoint a
SET status_priority = 3,
    updated_at      = t.updated_at,
    name            = t.name
FROM term t
WHERE a.asset_kind = 'TERM' AND a.asset_id = t.id;

UPDATE asset_search_entrypoint a
SET status_priority = 3,
    updated_at      = qe.updated_at,
    name            = NULL
FROM query_example qe
WHERE a.asset_kind = 'QUERY_EXAMPLE' AND a.asset_id = qe.id;

-- Any row not covered above (should be none) defaults to UNASSIGNED-priority, then tighten to NOT NULL.
UPDATE asset_search_entrypoint SET status_priority = 3 WHERE status_priority IS NULL;
ALTER TABLE asset_search_entrypoint
    ALTER COLUMN status_priority SET DEFAULT 3,
    ALTER COLUMN status_priority SET NOT NULL;

-- ---------------------------------------------------------------------------------------------------------
-- (1) Extend the V0_0_98 per-entrypoint sync functions to also set the sort columns from the base row.
-- The entrypoint trigger fires whenever the FTS vector is (re)written; by then the base row exists, so a
-- SELECT ... INTO populates the sort values, and the union row is created/updated WITH them (fresh-insert
-- edge). If the base row is somehow absent the vector is still mirrored (ST-4 guarantee preserved) with a
-- defensive status_priority of 3 and null updated_at/name.
-- ---------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_data_entity()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
DECLARE
    v_status_priority smallint;
    v_updated_at      timestamp without time zone;
    v_name            text;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'DATA_ENTITY' AND asset_id = OLD.data_entity_id;
        RETURN OLD;
    END IF;
    SELECT de.status_priority, de.source_updated_at, coalesce(de.internal_name, de.external_name)
        INTO v_status_priority, v_updated_at, v_name
        FROM data_entity de WHERE de.id = NEW.data_entity_id;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector, status_priority, updated_at, name)
        VALUES ('DATA_ENTITY', NEW.data_entity_id, NEW.search_vector, coalesce(v_status_priority, 3),
                v_updated_at, v_name)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET
            search_vector   = EXCLUDED.search_vector,
            status_priority = EXCLUDED.status_priority,
            updated_at      = EXCLUDED.updated_at,
            name            = EXCLUDED.name;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_term()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_at timestamp without time zone;
    v_name       text;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'TERM' AND asset_id = OLD.term_id;
        RETURN OLD;
    END IF;
    SELECT t.updated_at, t.name INTO v_updated_at, v_name
        FROM term t WHERE t.id = NEW.term_id;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector, status_priority, updated_at, name)
        VALUES ('TERM', NEW.term_id, NEW.search_vector, 3, v_updated_at, v_name)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET
            search_vector   = EXCLUDED.search_vector,
            status_priority = EXCLUDED.status_priority,
            updated_at      = EXCLUDED.updated_at,
            name            = EXCLUDED.name;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_query_example()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_at timestamp without time zone;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'QUERY_EXAMPLE' AND asset_id = OLD.query_example_id;
        RETURN OLD;
    END IF;
    SELECT qe.updated_at INTO v_updated_at
        FROM query_example qe WHERE qe.id = NEW.query_example_id;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector, status_priority, updated_at, name)
        VALUES ('QUERY_EXAMPLE', NEW.query_example_id, NEW.search_vector, 3, v_updated_at, NULL)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET
            search_vector   = EXCLUDED.search_vector,
            status_priority = EXCLUDED.status_priority,
            updated_at      = EXCLUDED.updated_at,
            name            = EXCLUDED.name;
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------------------------------------
-- (2) Base-table triggers: catch sort-field changes that do NOT rewrite the FTS vector. Scoped `UPDATE OF`
-- the sort-source columns only, so the view_count-increment hot path pays nothing. Eligibility columns
-- (hollow / exclude_from_search / deleted_at) are intentionally NOT listed — eligibility is a query-time
-- filter, not a denormalised column, so there is no eligibility to keep in sync here.
-- For DE, status_priority is derived from status by V0_0_96's BEFORE trigger, so triggering on `status`
-- (the app-written column) and reading the resulting NEW.status_priority is correct.
-- ---------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION asset_search_entrypoint_de_sortcols()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE asset_search_entrypoint
        SET status_priority = NEW.status_priority,
            updated_at      = NEW.source_updated_at,
            name            = coalesce(NEW.internal_name, NEW.external_name)
        WHERE asset_kind = 'DATA_ENTITY' AND asset_id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS asset_search_entrypoint_de_sortcols_trg ON data_entity;
CREATE TRIGGER asset_search_entrypoint_de_sortcols_trg
    AFTER UPDATE OF status, internal_name, external_name, source_updated_at ON data_entity
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_de_sortcols();

CREATE OR REPLACE FUNCTION asset_search_entrypoint_term_sortcols()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE asset_search_entrypoint
        SET updated_at = NEW.updated_at,
            name       = NEW.name
        WHERE asset_kind = 'TERM' AND asset_id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS asset_search_entrypoint_term_sortcols_trg ON term;
CREATE TRIGGER asset_search_entrypoint_term_sortcols_trg
    AFTER UPDATE OF name, updated_at ON term
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_term_sortcols();

CREATE OR REPLACE FUNCTION asset_search_entrypoint_query_example_sortcols()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE asset_search_entrypoint
        SET updated_at = NEW.updated_at
        WHERE asset_kind = 'QUERY_EXAMPLE' AND asset_id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS asset_search_entrypoint_query_example_sortcols_trg ON query_example;
CREATE TRIGGER asset_search_entrypoint_query_example_sortcols_trg
    AFTER UPDATE OF updated_at ON query_example
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_query_example_sortcols();

-- ---------------------------------------------------------------------------------------------------------
-- NULLS-aligned composite btree indexes carrying the (asset_kind ASC, asset_id DESC) tiebreaker, matching
-- ReactiveAssetSearchRepositoryImpl.orderFields exactly so the browse sorts are an ordered Index Scan with
-- no Sort node. The name index is functional on lower(name) (parity with ST-4's lower(...) ordering; the
-- ICU-collation upgrade is a separate behaviour-changing follow-up, not this slice).
-- ---------------------------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS asset_search_entrypoint_status_priority_idx
    ON asset_search_entrypoint (status_priority ASC, asset_kind ASC, asset_id DESC);

CREATE INDEX IF NOT EXISTS asset_search_entrypoint_updated_at_idx
    ON asset_search_entrypoint (updated_at DESC NULLS LAST, asset_kind ASC, asset_id DESC);

CREATE INDEX IF NOT EXISTS asset_search_entrypoint_name_idx
    ON asset_search_entrypoint (lower(name) ASC NULLS LAST, asset_kind ASC, asset_id DESC);
