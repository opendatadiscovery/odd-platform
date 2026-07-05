-- Saved searches (issue #1837 / ST-3 of the #1825 search overhaul; ADR D11) — named, per-user, editable
-- saved searches. Keyed on the logged-in identity (oidc_username, provider), reusing the Favorites identity
-- foundation (V0_0_94) — NOT the internal Owner. `spec` holds the parametrised search state (the same
-- SearchFormData the URL encodes: query + filters + sort), so one canonical spec drives both the shareable
-- URL (ADR D10) and the saved row; sharing is the URL, not a server-side grant. UTC timestamps.
CREATE TABLE IF NOT EXISTS saved_search
(
    id            bigserial PRIMARY KEY,
    oidc_username varchar(512)                NOT NULL,
    provider      varchar(255)                NOT NULL,
    name          varchar(255)                NOT NULL,
    spec          jsonb                       NOT NULL,
    created_at    timestamp without time zone NOT NULL DEFAULT (now() at time zone 'UTC'),
    updated_at    timestamp without time zone NOT NULL DEFAULT (now() at time zone 'UTC')
);

-- A saved-search name is unique per user — clean select/rename semantics; a duplicate create/rename is
-- rejected as a UniqueConstraintException (a clean 4xx), never a 500. Leads with the identity so the
-- uniqueness check and the per-user list are both index-served.
CREATE UNIQUE INDEX IF NOT EXISTS saved_search_identity_name_key
    ON saved_search (oidc_username, provider, name);

-- List ordering: one user's saved searches, newest first. Hard delete (no soft-delete) — a removed saved
-- search is gone and its name is immediately reusable.
CREATE INDEX IF NOT EXISTS saved_search_identity_created_idx
    ON saved_search (oidc_username, provider, created_at DESC);
