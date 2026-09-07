package org.opendatadiscovery.oddplatform.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The fail-closed parse of the wire {@code sort} value (CTRIB-053 / #1836 ST-2a). A known name
 * (case-insensitive, trimmed) resolves; anything else — including null/blank — is {@link java.util.Optional#empty()}
 * so the caller falls back to the per-context default rather than rejecting the request.
 */
@DisplayName("SearchSortDto - fail-closed sort parse")
class SearchSortDtoTest {

    @Test
    void resolvesKnownValues_caseInsensitiveAndTrimmed() {
        assertThat(SearchSortDto.fromString("STATUS_PRIORITY")).contains(SearchSortDto.STATUS_PRIORITY);
        assertThat(SearchSortDto.fromString("relevance")).contains(SearchSortDto.RELEVANCE);
        assertThat(SearchSortDto.fromString("  Name  ")).contains(SearchSortDto.NAME);
        assertThat(SearchSortDto.fromString("updated_at")).contains(SearchSortDto.UPDATED_AT);
    }

    @Test
    void resolvesPopularity_theFifthToken() {
        assertThat(SearchSortDto.fromString("popularity")).contains(SearchSortDto.POPULARITY);
        assertThat(SearchSortDto.fromString(" POPULARITY ")).contains(SearchSortDto.POPULARITY);
        // a stored-column sort: effective with AND without a query (never folds to relevance)
        assertThat(SearchSortDto.resolveEffective("popularity", true)).isEqualTo(SearchSortDto.POPULARITY);
        assertThat(SearchSortDto.resolveEffective("popularity", false)).isEqualTo(SearchSortDto.POPULARITY);
    }

    /**
     * ST-10 (#1844) — the recency sort's two rules, as a truth table. Both matter because the effective sort is
     * derived INDEPENDENTLY in two places (the service, which scopes the cursor, and the repository, which builds
     * the ORDER BY): if they disagreed, a page would be ordered by one column and paged by another.
     */
    @Test
    @DisplayName("LAST_VIEWED needs the recency scope, and with it becomes the BROWSE default")
    void lastViewedRequiresTheScope_andBecomesTheBrowseDefault() {
        assertThat(SearchSortDto.fromString("last_viewed")).contains(SearchSortDto.LAST_VIEWED);

        // WITHOUT the scope the caller's history is never joined, so there is no column to order by. The token
        // degrades to the per-context default exactly as an unknown one does — never an error, never a silent
        // order by something else.
        assertThat(SearchSortDto.resolveEffective("last_viewed", false, false))
            .isEqualTo(SearchSortDto.STATUS_PRIORITY);
        assertThat(SearchSortDto.resolveEffective("last_viewed", true, false))
            .isEqualTo(SearchSortDto.RELEVANCE);

        // WITH the scope it is honoured, with or without a query.
        assertThat(SearchSortDto.resolveEffective("last_viewed", false, true))
            .isEqualTo(SearchSortDto.LAST_VIEWED);
        assertThat(SearchSortDto.resolveEffective("last_viewed", true, true))
            .isEqualTo(SearchSortDto.LAST_VIEWED);

        // The scope also REPLACES status-priority as the browse default, so "the assets I opened" reads as a
        // history rather than as a status-ordered list...
        assertThat(SearchSortDto.resolveEffective(null, false, true))
            .isEqualTo(SearchSortDto.LAST_VIEWED);
        assertThat(SearchSortDto.resolveEffective("garbage", false, true))
            .isEqualTo(SearchSortDto.LAST_VIEWED);
        // ...including the meaningless relevance-without-a-query case, which folds to the browse default.
        assertThat(SearchSortDto.resolveEffective("relevance", false, true))
            .isEqualTo(SearchSortDto.LAST_VIEWED);

        // ...but a text query still wins with relevance: the scope changes the BROWSE default only.
        assertThat(SearchSortDto.resolveEffective(null, true, true)).isEqualTo(SearchSortDto.RELEVANCE);

        // An explicitly chosen other ordering is untouched by the scope.
        assertThat(SearchSortDto.resolveEffective("name", false, true)).isEqualTo(SearchSortDto.NAME);
        assertThat(SearchSortDto.resolveEffective("popularity", false, true))
            .isEqualTo(SearchSortDto.POPULARITY);

        // The 2-arg overload is the no-scope case, so every existing caller keeps its behaviour.
        assertThat(SearchSortDto.resolveEffective("last_viewed", false))
            .isEqualTo(SearchSortDto.STATUS_PRIORITY);
    }

    @Test
    void failsClosedOnUnknownNullOrBlank() {
        assertThat(SearchSortDto.fromString("garbage")).isEmpty();
        assertThat(SearchSortDto.fromString(null)).isEmpty();
        assertThat(SearchSortDto.fromString("")).isEmpty();
        assertThat(SearchSortDto.fromString("   ")).isEmpty();
    }
}
