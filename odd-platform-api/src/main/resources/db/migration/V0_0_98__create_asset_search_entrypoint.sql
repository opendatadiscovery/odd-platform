-- CTRIB-056 / #1838 ST-4 — the unified cross-kind search index (asset_search_entrypoint).
--
-- The main /search is data-entity-only; Terms and Query Examples each have their own FTS
-- entrypoint + dedicated search. This adds ONE polymorphic FTS index over all three kinds so a
-- single ranked query can return a mixed-kind result (Unified Asset Search ADR D1). It is
-- ADDITIVE: the per-kind entrypoints + /api/search keep working unchanged (ADR D9).
--
-- Design:
--   * The row is (asset_kind, asset_id, search_vector) — the polymorphic (asset_kind, asset_id)
--     pair the Favorites / Recently-Viewed model already uses (asset_kind values match the AssetKind
--     enum + the favorite.asset_kind varchar convention). The pair is the key because the three kinds
--     use independent id sequences (ids collide across kinds).
--   * search_vector is a COPY of each per-kind entrypoint's already-maintained `search_vector`
--     (itself a GENERATED STORED tsvector) — copying gives full recall parity with the per-kind
--     searches. Display refs and every filterable / sortable column (name, status_priority,
--     updated_at, entity classes, the shared facets) are resolved by joining back to the base tables
--     at query time (ADR D2 live semi-join), so this index carries ONLY what is needed to MATCH; it
--     never denormalises display / sort data that would drift.
--   * Maintenance is a per-entrypoint AFTER trigger — the same "a future application write-path can
--     never forget it" rationale as V0_0_96's status_priority trigger. Every FTS write funnels through
--     an UPSERT into a per-kind *_search_entrypoint table, so an AFTER INSERT/UPDATE/DELETE trigger on
--     each of the three entrypoint tables mirrors the change into asset_search_entrypoint — catching
--     all ~11 DE / ~5 Term / QE write-paths at their single DB choke point, without scattered app hooks.
--   * Read-time eligibility (hollow / exclude_from_search for DE; deleted_at for Term/QE) is applied by
--     the ranked query's join, so this index is a plain mirror of the per-kind entrypoints.

CREATE TABLE IF NOT EXISTS asset_search_entrypoint
(
    asset_kind    varchar(64) NOT NULL,
    asset_id      bigint      NOT NULL,
    search_vector tsvector,
    PRIMARY KEY (asset_kind, asset_id)
);

CREATE INDEX IF NOT EXISTS asset_search_entrypoint_search_vector_gin_idx
    ON asset_search_entrypoint USING gin (search_vector);

-- One sync function per source entrypoint (each entrypoint's PK column differs:
-- data_entity_id / term_id / query_example_id), mirroring INSERT/UPDATE/DELETE into the unified row.

CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_data_entity()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'DATA_ENTITY' AND asset_id = OLD.data_entity_id;
        RETURN OLD;
    END IF;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
        VALUES ('DATA_ENTITY', NEW.data_entity_id, NEW.search_vector)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET search_vector = EXCLUDED.search_vector;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_term()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'TERM' AND asset_id = OLD.term_id;
        RETURN OLD;
    END IF;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
        VALUES ('TERM', NEW.term_id, NEW.search_vector)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET search_vector = EXCLUDED.search_vector;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION asset_search_entrypoint_sync_query_example()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM asset_search_entrypoint
            WHERE asset_kind = 'QUERY_EXAMPLE' AND asset_id = OLD.query_example_id;
        RETURN OLD;
    END IF;
    INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
        VALUES ('QUERY_EXAMPLE', NEW.query_example_id, NEW.search_vector)
        ON CONFLICT (asset_kind, asset_id) DO UPDATE SET search_vector = EXCLUDED.search_vector;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS asset_search_entrypoint_data_entity_trg ON search_entrypoint;
CREATE TRIGGER asset_search_entrypoint_data_entity_trg
    AFTER INSERT OR UPDATE OR DELETE ON search_entrypoint
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_sync_data_entity();

DROP TRIGGER IF EXISTS asset_search_entrypoint_term_trg ON term_search_entrypoint;
CREATE TRIGGER asset_search_entrypoint_term_trg
    AFTER INSERT OR UPDATE OR DELETE ON term_search_entrypoint
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_sync_term();

DROP TRIGGER IF EXISTS asset_search_entrypoint_query_example_trg ON query_example_search_entrypoint;
CREATE TRIGGER asset_search_entrypoint_query_example_trg
    AFTER INSERT OR UPDATE OR DELETE ON query_example_search_entrypoint
    FOR EACH ROW
    EXECUTE FUNCTION asset_search_entrypoint_sync_query_example();

-- Backfill: mirror every existing per-kind entrypoint row into the unified index.
-- ON CONFLICT DO NOTHING is defensive (the table is new / empty). Read-time eligibility is applied by
-- the ranked query (matching the trigger), so no eligibility WHERE is needed here.
INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
    SELECT 'DATA_ENTITY', data_entity_id, search_vector FROM search_entrypoint
    ON CONFLICT (asset_kind, asset_id) DO NOTHING;

INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
    SELECT 'TERM', term_id, search_vector FROM term_search_entrypoint
    ON CONFLICT (asset_kind, asset_id) DO NOTHING;

INSERT INTO asset_search_entrypoint (asset_kind, asset_id, search_vector)
    SELECT 'QUERY_EXAMPLE', query_example_id, search_vector FROM query_example_search_entrypoint
    ON CONFLICT (asset_kind, asset_id) DO NOTHING;
