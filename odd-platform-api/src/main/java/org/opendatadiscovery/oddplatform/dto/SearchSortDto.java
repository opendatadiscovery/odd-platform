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
    POPULARITY;

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
        final SearchSortDto resolved = fromString(sortParam).orElse(hasQuery ? RELEVANCE : STATUS_PRIORITY);
        return resolved == RELEVANCE && !hasQuery ? STATUS_PRIORITY : resolved;
    }
}
