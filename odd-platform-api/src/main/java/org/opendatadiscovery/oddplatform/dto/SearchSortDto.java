package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Optional;

/**
 * The named canonical orderings the data-entity search exposes (CTRIB-053 / #1836 ST-2a).
 *
 * <p>The wire carries the ordering as a plain string ({@code SearchFormData.sort}); this enum is the
 * server-side allow-list. Resolution is fail-closed — an absent or unrecognised value maps to
 * {@link Optional#empty()}, and the caller falls back to the per-context default (relevance for a
 * text query, status priority for empty browse). This mirrors the ST-1/D10 "unknown params ignored"
 * posture and avoids a strict enum that would reject an unknown value with a 4xx.
 */
public enum SearchSortDto {
    RELEVANCE,
    STATUS_PRIORITY,
    UPDATED_AT,
    NAME,
    /**
     * "Most popular" (ST-9 / #1843, ADR unified-asset-search D5 / D12): the snapshotted {@code popularity_score}
     * DESC — the 15-minute bucketed view-count band on the unified index, never the live counter — with terms and
     * query examples (no view count, score 0) last. Honoured by the cross-kind {@code /api/search/assets} only; the
     * legacy {@code /api/search} session resolves it to the per-context default, exactly as an unknown token
     * ({@code ReactiveDataEntityRepositoryImpl.getSearchResultOrderFields}).
     */
    POPULARITY,
    /**
     * "Recently viewed" (ST-10 / #1844, ADR unified-asset-search D3): the caller's own {@code last_viewed_at} DESC —
     * most-recently-opened first. Meaningful ONLY while an {@code AssetSearchFormData.recently_viewed} scope is
     * present, because that scope is what joins the caller's history into the query; without it there is no column to
     * order by, so {@link #resolveEffective(String, boolean, boolean)} drops the token to the per-context default
     * exactly as it drops an unknown one. With the scope present it is also the BROWSE default (see there).
     */
    LAST_VIEWED;

    public static Optional<SearchSortDto> fromString(final String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(sort -> sort.name().equalsIgnoreCase(value.trim()))
            .findFirst();
    }

    /**
     * The sort that actually orders the page, folding the per-context defaults + the "relevance needs a query"
     * rule into one place (ST-5b — the repository ORDER BY, the keyset-vs-offset choice, and the cursor scope
     * must all agree on this). An absent / unknown value defaults to relevance for a text query, else the
     * status-priority browse default; and {@code RELEVANCE} without a query (meaningless — {@code ts_rank} needs
     * a query) folds back to the browse default so empty browse is keyset-paged, not offset-paged.
     */
    public static SearchSortDto resolveEffective(final String sortParam, final boolean hasQuery) {
        return resolveEffective(sortParam, hasQuery, false);
    }

    /**
     * The sort that actually orders the page, with the recency scope taken into account (ST-10 / #1844).
     *
     * <p>Two rules, both of which must hold identically wherever the effective sort is derived — the service (which
     * also scopes the cursor) and the repository (which builds the ORDER BY) each resolve it independently, and a
     * disagreement between them would page one way and order another:
     *
     * <ul>
     *   <li>{@link #LAST_VIEWED} REQUIRES the scope. Without it the caller's history is not joined, so there is no
     *       column to order by; the token then degrades to the per-context default exactly as an unknown token does
     *       (the {@link #POPULARITY}-on-the-legacy-path precedent), never to an error.</li>
     *   <li>WITH the scope, {@code LAST_VIEWED} replaces {@code STATUS_PRIORITY} as the BROWSE default: an empty
     *       query resolves to it, so "the assets I opened" reads as a history rather than as a status-ordered list.
     *       A non-empty query still resolves to {@link #RELEVANCE} — the scope changes the browse default only.</li>
     * </ul>
     *
     * @param hasRecencyScope whether the request carries an {@code AssetSearchFormData.recently_viewed} object
     */
    public static SearchSortDto resolveEffective(final String sortParam, final boolean hasQuery,
                                                 final boolean hasRecencyScope) {
        final SearchSortDto browseDefault = hasRecencyScope ? LAST_VIEWED : STATUS_PRIORITY;
        final SearchSortDto resolved = fromString(sortParam)
            .filter(requested -> requested != LAST_VIEWED || hasRecencyScope)
            .orElse(hasQuery ? RELEVANCE : browseDefault);
        return resolved == RELEVANCE && !hasQuery ? browseDefault : resolved;
    }
}
