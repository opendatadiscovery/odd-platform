-- GHSA-8wf2-7c5g-h59v / PLT-120 -- cross-mode identity disambiguation.
--
-- AuthIdentityProviderImpl now emits the configured auth-mode literal (LOGIN_FORM / LDAP) as the
-- provider for non-OAUTH2 logins instead of NULL, so two different people who share a username
-- across modes no longer collapse onto the same Owner. Existing user_owner_mapping rows were written
-- with provider = NULL; without this backfill the post-upgrade (oidc_username, provider) lookup would
-- stop matching them and every existing non-OAUTH2 user would silently lose their Owner on next login.
--
-- Guarded to LOGIN_FORM / LDAP: under OAUTH2 the provider is the OAuth2 client registration id
-- (never the literal 'OAUTH2'), and under DISABLED there is no persisted login -- so neither needs
-- this backfill, and the guard makes the statement a strict no-op there (0 rows touched). OAUTH2
-- deployments (e.g. demo.oddp.io) are therefore not mutated.
--
-- '${authtype}' is the Flyway placeholder bound from auth.type (spring.flyway.placeholders.authtype).
--
-- A deployment that already ran two non-OAUTH2 modes under a colliding username holds multiple active
-- (username, NULL) rows; backfilling them to the same mode literal trips the
-- user_owner_mapping_oidc_username_provider_deleted_key unique index and FAILS this migration by
-- design -- fail-closed, because it must not silently choose which user keeps the Owner. Disambiguate
-- those rows per the cross-auth-mode migration runbook before upgrading.
UPDATE user_owner_mapping
SET provider = '${authtype}'
WHERE provider IS NULL
  AND '${authtype}' IN ('LOGIN_FORM', 'LDAP');
