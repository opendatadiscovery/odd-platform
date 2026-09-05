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

    @Test
    void failsClosedOnUnknownNullOrBlank() {
        assertThat(SearchSortDto.fromString("garbage")).isEmpty();
        assertThat(SearchSortDto.fromString(null)).isEmpty();
        assertThat(SearchSortDto.fromString("")).isEmpty();
        assertThat(SearchSortDto.fromString("   ")).isEmpty();
    }
}
