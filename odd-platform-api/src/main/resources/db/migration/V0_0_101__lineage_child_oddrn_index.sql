-- CTRIB-062 / #1842 ST-8 — an index on lineage(child_oddrn), so the UPSTREAM lineage walk is an index
-- scan instead of a sequential scan.
--
-- WHY. The My-data filter walks lineage from the caller's owned set in both directions, up to three hops,
-- on every search request that selects an Upstream/Downstream scope. Each hop is a single lookup:
--     DOWNSTREAM:  ... WHERE parent_oddrn IN (...)
--     UPSTREAM:    ... WHERE child_oddrn  IN (...)
-- `lineage`'s only indexes today are the primary key (parent_oddrn, child_oddrn, establisher_oddrn) from
-- V0_0_17 and lineage_establisher_oddrn. The PK's LEADING column is parent_oddrn, so the DOWNSTREAM hop
-- range-starts on it, but the UPSTREAM hop cannot use it at all and must scan the whole table.
--
-- MEASURED, not assumed (odd-team CTRIB-062 plan-time probe, on postgres:13.2-alpine — the deployed
-- version — against this exact DDL with a dense 50 000-edge fixture, 200 anchor oddrns per hop):
--     DOWNSTREAM hop  -> Bitmap Index Scan on lineage_pkey        29.95 ms
--     UPSTREAM   hop  -> Seq Scan on lineage                     880.46 ms
--     UPSTREAM   hop  -> Bitmap Index Scan on this index          22.40 ms   (39x)
-- Three upstream hops would otherwise cost ~2.6 s of pure sequential scanning per search request, which
-- the ST-8 performance gate (a release gate under the unified-asset-search ADR) cannot absorb.
--
-- SCOPE. Additive and non-destructive: one index, no data change, no column change, no behaviour change to
-- any existing query — the planner simply gains a path the UPSTREAM predicate can use. The existing
-- lineage-graph traversal (ReactiveLineageRepositoryImpl.lineageCte, used by the entity Lineage view)
-- anchors on the same columns and benefits identically; it is not otherwise touched by this slice.
--
-- Plain CREATE INDEX (not CONCURRENTLY): Flyway runs each migration inside a transaction, and
-- CONCURRENTLY cannot run in one. This matches every other index in this migration set.

CREATE INDEX IF NOT EXISTS lineage_child_oddrn ON lineage (child_oddrn);

-- ---------------------------------------------------------------------------------------------------------
-- The OWNERSHIP side of the same walk. Indexing only the lineage side would have left the other half of
-- every My-data query on a sequential scan.
--
-- Both `ownership` and `term_ownership` are looked up by OWNER — the My-Objects semi-join
-- (`... WHERE owner_id = ?`) and the first lineage hop's anchor subquery — but in both tables `owner_id` is
-- the SECOND column of the only composite index (`ownership(data_entity_id, owner_id)`,
-- `term_ownership(term_id, owner_id)`), so a predicate on `owner_id` alone cannot range-start on either.
--
-- MEASURED (same probe method as above, postgres:13.2-alpine, 400 000 ownership rows over 500 owners):
--     SELECT data_entity_id FROM ownership WHERE owner_id = ?
--       before -> Parallel Seq Scan            107.1 ms
--       after  -> Bitmap Index Scan              4.9 ms      (22x)
--
-- This runs on EVERY search that selects a My-data scope, so it is the same class of finding as the
-- child_oddrn index above and belongs in the same migration.

CREATE INDEX IF NOT EXISTS ownership_owner_id ON ownership (owner_id);
CREATE INDEX IF NOT EXISTS term_ownership_owner_id ON term_ownership (owner_id);
