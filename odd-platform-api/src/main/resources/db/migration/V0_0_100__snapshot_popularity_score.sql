-- CTRIB-059 / #1839 ST-5c — snapshotted/bucketed popularity_score on asset_search_entrypoint (finishes #1839).
--
-- ST-5's third and final substrate: a popularity dimension the unified cross-kind search can rank/filter by
-- (consumed by #1861's "Most popular" sort and ST-9's Popular numeric-range facet). ADR unified-asset-search D5
-- +its rev-3 SRE correction (adrs/.../SEARCH-CAPABILITIES-DESIGN.md §2): index a SNAPSHOTTED / BUCKETED
-- popularity_score, NOT the live data_entity.view_count. view_count is a known write-contention hotspot
-- (concepts.yaml:564 — the UPDATE on the hottest read is row-locked O(reads)); denormalising it LIVE onto the
-- search index would couple index writes to read volume (every page-view would dirty an index row). Instead we
-- store a periodic SNAPSHOT, refreshed by AssetPopularitySnapshotJob on a cadence — and DELIBERATELY add NO
-- trigger on view_count, so the read hot path stays completely decoupled from the search index (the whole point
-- of this slice). Approximate popularity ordering is fine for browse (D5).
--
-- Bucketing: a log2 band of view_count (least(20, floor(log2(view_count+1)))). Bucketing keeps the index stable
-- (a view_count of 1000->1005 stays in the same bucket, so the periodic refresh rarely re-writes an index row)
-- and gives ST-9's width_bucket histogram a distribution-preserving input over power-law view counts. The bucket
-- is a SINGLE SQL function reused by BOTH the backfill below AND the refresh job's UPDATE, so the two can never
-- diverge. Popularity is DATA-ENTITY-ONLY (Terms / Query Examples have no view_count) -> non-DE rows keep 0.
--
-- Scope (ST-5c): ONLY the popularity substrate (column + bucket fn + backfill + index + the refresh job). The
-- user-visible "Most popular" sort option + the browse-default fork are #1861 (blocked-on-5c); the Popular
-- numeric-range facet + histogram are ST-9. This migration adds no sort wiring and touches no query.

-- ---------------------------------------------------------------------------------------------------------
-- The bucketing function — the single source of truth for backfill (here) + refresh (AssetPopularitySnapshotJob).
-- greatest(v,0) makes it NULL-safe (greatest ignores NULL -> 0) and negative-safe; +1 avoids ln(0); the least()
-- cap bounds the top tier (~1M+ views collapse to 20) so the sort/histogram stay bounded. IMMUTABLE + PARALLEL
-- SAFE: a pure function of its input.
-- ---------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION asset_popularity_bucket(v bigint)
    RETURNS smallint
    LANGUAGE sql
    IMMUTABLE
    PARALLEL SAFE
AS $$
    -- cast to double precision BEFORE +1 so a bigint-max view_count cannot overflow (the +1 happens in float).
    SELECT least(20, floor(ln(greatest(v, 0)::double precision + 1) / ln(2.0::double precision)))::smallint;
$$;

-- ---------------------------------------------------------------------------------------------------------
-- The column. NOT NULL DEFAULT 0 is a metadata-only fast default on Postgres 11+ (odd-platform runs 13.x) —
-- no table rewrite. Non-DE rows (Term / QE) keep the DEFAULT 0 (popularity is DE-only). A fresh DE's union row
-- is created by the V0_0_98/V0_0_99 sync trigger WITHOUT this column (so it takes DEFAULT 0, ~0 views), and the
-- refresh job owns every subsequent value — the sync functions are intentionally NOT modified here.
-- ---------------------------------------------------------------------------------------------------------
ALTER TABLE asset_search_entrypoint
    ADD COLUMN IF NOT EXISTS popularity_score smallint NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------------------------------------
-- Backfill the existing DE union rows from the current view_count (via the SAME bucket function the job uses).
-- Term / QE rows stay 0 (no view_count).
-- ---------------------------------------------------------------------------------------------------------
UPDATE asset_search_entrypoint a
SET popularity_score = asset_popularity_bucket(de.view_count)
FROM data_entity de
WHERE a.asset_kind = 'DATA_ENTITY' AND a.asset_id = de.id;

-- ---------------------------------------------------------------------------------------------------------
-- The NULLS-aligned composite btree carrying the (asset_kind ASC, asset_id DESC) tiebreaker — the exact shape
-- #1861's "Most popular" sort (popularity_score DESC NULLS LAST + the stable id tiebreaker, keyset-compatible
-- with #1860) and ST-9's range facet will consume, so a popularity-ordered page (or a range predicate) is an
-- ordered Index Scan with no Sort node and #1861 seeks on it with no further migration. popularity_score is
-- NOT NULL, so NULLS LAST is a no-op for this column but is kept to match the consumer contract verbatim.
-- ---------------------------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS asset_search_entrypoint_popularity_idx
    ON asset_search_entrypoint (popularity_score DESC NULLS LAST, asset_kind ASC, asset_id DESC);

-- NOTE (the decoupling — the whole slice): there is DELIBERATELY no trigger on data_entity.view_count and
-- view_count appears in no trigger's `UPDATE OF` list. A view_count increment (DataEntityServiceImpl ->
-- ReactiveDataEntityRepositoryImpl.incrementViewCount) must NOT touch this index; popularity_score moves only
-- when AssetPopularitySnapshotJob next runs.
