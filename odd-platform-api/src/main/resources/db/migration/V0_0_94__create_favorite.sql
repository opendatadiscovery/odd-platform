-- Favorites foundation (issue #1815 / PRD-0001 §5, §7.6) — the per-user, ownership-free,
-- navigation-only "starred assets" store. Keyed on the logged-in identity (oidc_username, provider),
-- NOT the internal Owner. Polymorphic asset reference (asset_kind, asset_id) — ids collide across
-- kinds, so the pair is mandatory. No FK to the asset tables (overlapping id-spaces, heterogeneous
-- delete) — orphans are handled by filter-on-read + a housekeeping sweep. UTC timestamps.
CREATE TABLE IF NOT EXISTS favorite
(
    id            bigserial PRIMARY KEY,
    oidc_username varchar(512)                NOT NULL,
    provider      varchar(255)                NOT NULL,
    asset_kind    varchar(64)                 NOT NULL, -- DATA_ENTITY | TERM | QUERY_EXAMPLE
    asset_id      bigint                      NOT NULL,
    created_at    timestamp without time zone NOT NULL DEFAULT (now() at time zone 'UTC'),
    deleted_at    timestamp without time zone          DEFAULT NULL
);

-- One logical favorite row per (user, asset) ever; set-state toggles deleted_at via UPSERT
-- (re-star = ON CONFLICT DO UPDATE SET deleted_at = NULL, created_at = now()). Full 4-tuple,
-- NOT partial — the conflict target must match the active and the soft-deleted row alike.
CREATE UNIQUE INDEX IF NOT EXISTS favorite_identity_asset_key
    ON favorite (oidc_username, provider, asset_kind, asset_id);

-- List/panel ordering: the active favorites of one user, newest first.
CREATE INDEX IF NOT EXISTS favorite_identity_created_active_idx
    ON favorite (oidc_username, provider, created_at DESC) WHERE deleted_at IS NULL;
