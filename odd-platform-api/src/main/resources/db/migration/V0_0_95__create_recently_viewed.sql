-- Recently-Viewed foundation (issue #1816 / PRD-0001 §5, §7.6) — the per-user, ownership-free,
-- navigation-only "assets I recently opened" store, the recency companion to `favorite` (V0_0_94).
-- Keyed on the logged-in identity (oidc_username, provider), NOT the internal Owner. Polymorphic
-- asset reference (asset_kind, asset_id) — ids collide across kinds, so the pair is mandatory.
-- No FK to the asset tables (overlapping id-spaces, heterogeneous delete) — orphans are handled by
-- filter-on-read + a housekeeping sweep. Unlike `favorite`, removal is a HARD delete (no deleted_at):
-- a recently-viewed entry is uncurated and bounded by the retention job, so a soft-delete tombstone
-- would only add churn. UTC timestamps.
CREATE TABLE IF NOT EXISTS recently_viewed
(
    id             bigserial PRIMARY KEY,
    oidc_username  varchar(512)                NOT NULL,
    provider       varchar(255)                NOT NULL,
    asset_kind     varchar(64)                 NOT NULL, -- DATA_ENTITY | TERM | QUERY_EXAMPLE
    asset_id       bigint                      NOT NULL,
    last_viewed_at timestamp without time zone NOT NULL DEFAULT (now() at time zone 'UTC')
);

-- One row per (user, asset); recording an open is an UPSERT that moves the row to "now"
-- (ON CONFLICT DO UPDATE SET last_viewed_at = now()) — dedup + move-to-top with no append churn.
CREATE UNIQUE INDEX IF NOT EXISTS recently_viewed_identity_asset_key
    ON recently_viewed (oidc_username, provider, asset_kind, asset_id);

-- List/panel ordering and the newest-N-per-user retention trim: one user's entries, most-recent first.
CREATE INDEX IF NOT EXISTS recently_viewed_identity_ts_idx
    ON recently_viewed (oidc_username, provider, last_viewed_at DESC);
