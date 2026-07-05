package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SavedSearchPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Owner-scoped persistence for saved searches (ST-3 / ADR D11). Every operation is keyed on the caller's
 * identity tuple {@code (oidcUsername, provider)} — supplied by the service from the security context, never
 * from the request — so a user can only ever read, edit, or delete their own saved searches. By-id operations
 * carry the identity in the WHERE clause and return empty/0 for a row owned by someone else, so the caller can
 * map that to a 404 without leaking the row's existence.
 */
public interface ReactiveSavedSearchRepository {

    /** Create a saved search owned by {@code (oidcUsername, provider)}; returns the persisted row. */
    Mono<SavedSearchPojo> create(String oidcUsername, String provider, String name, JSONB spec);

    /** The current user's saved searches, newest first, paginated. */
    Flux<SavedSearchPojo> list(String oidcUsername, String provider, int offset, int limit);

    /** Count of the current user's saved searches (for page info). */
    Mono<Long> count(String oidcUsername, String provider);

    /** The user's OWN saved search by id, or empty if it is absent or owned by someone else. */
    Mono<SavedSearchPojo> get(long id, String oidcUsername, String provider);

    /**
     * Rename + replace the spec of the user's OWN saved search; returns the updated row, or empty if no row
     * with that id is owned by {@code (oidcUsername, provider)} — the caller maps empty to 404.
     */
    Mono<SavedSearchPojo> update(long id, String oidcUsername, String provider, String name, JSONB spec);

    /** Hard-delete the user's OWN saved search; returns the number of rows removed (0 = not owned/absent → 404). */
    Mono<Integer> delete(long id, String oidcUsername, String provider);

    /**
     * Whether the user already has a saved search named {@code name}, optionally excluding {@code excludeId}
     * (so a rename that keeps the same name is not a false conflict). Backs the unique-name-per-user check.
     */
    Mono<Boolean> existsByName(String oidcUsername, String provider, String name, Long excludeId);
}
