package org.opendatadiscovery.oddplatform.dto;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test for the opaque, sort-scoped, FAIL-CLOSED asset-search cursor codec (CTRIB-058 / #1839 ST-5b). The
 * codec is the user-facing pagination-token surface: it must round-trip every shape and MUST fail closed (→ the
 * first page, never an exception) on any absent / malformed / tampered / foreign-sort token — the D10 / IT-003
 * security posture. Plain unit test (no Spring, no DB) so every branch is exercised cheaply.
 */
@DisplayName("AssetSearchCursor - opaque sort-scoped fail-closed codec (CTRIB-058 / #1839 ST-5b)")
class AssetSearchCursorTest {

    @Test
    @DisplayName("keyset cursors round-trip for each stored-column sort, including the nulls-last tail")
    void keysetCursorsRoundTrip() {
        roundTripKeyset(SearchSortDto.STATUS_PRIORITY, "3", false, "DATA_ENTITY", 42L);
        roundTripKeyset(SearchSortDto.UPDATED_AT, "2022-03-23T18:00", false, "TERM", 7L);
        roundTripKeyset(SearchSortDto.NAME, "some \"quoted\" name", false, "DATA_ENTITY", 100L);
        roundTripKeyset(SearchSortDto.UPDATED_AT, null, true, "QUERY_EXAMPLE", 5L);   // the null tail
        roundTripKeyset(SearchSortDto.NAME, null, true, "TERM", 9L);
    }

    @Test
    @DisplayName("a relevance cursor round-trips its offset")
    void relevanceCursorRoundTrips() {
        final Optional<AssetSearchCursor> decoded = AssetSearchCursor.decode(
            AssetSearchCursor.relevance(SearchSortDto.RELEVANCE, 60).encode(), SearchSortDto.RELEVANCE);
        assertThat(decoded).isPresent();
        assertThat(decoded.get().sort()).isEqualTo(SearchSortDto.RELEVANCE);
        assertThat(decoded.get().offset()).isEqualTo(60);
        // a relevance cursor has no keyset position — the null-safe accessors return defaults.
        assertThat(decoded.get().assetId()).isZero();
        assertThat(decoded.get().sortValue()).isNull();
    }

    @Test
    @DisplayName("a cursor minted for another sort is NOT applied to this sort (sort-scoped → fail closed)")
    void foreignSortCursorFailsClosed() {
        final String nameCursor =
            AssetSearchCursor.keyset(SearchSortDto.NAME, "z", false, "DATA_ENTITY", 1L).encode();
        assertThat(AssetSearchCursor.decode(nameCursor, SearchSortDto.STATUS_PRIORITY)).isEmpty();
        assertThat(AssetSearchCursor.decode(nameCursor, SearchSortDto.UPDATED_AT)).isEmpty();
        assertThat(AssetSearchCursor.decode(nameCursor, SearchSortDto.RELEVANCE)).isEmpty();
    }

    @Test
    @DisplayName("absent / non-base64 / non-json tokens fail closed (never throw)")
    void absentOrGarbageTokensFailClosed() {
        for (final String bad : List.of("", "   ", "not-base64-@@@!!!")) {
            assertThat(AssetSearchCursor.decode(bad, SearchSortDto.STATUS_PRIORITY)).as(bad).isEmpty();
        }
        assertThat(AssetSearchCursor.decode(null, SearchSortDto.NAME)).isEmpty();
        // valid base64 whose JSON has no recognised sort ("s") — fromString is empty → fail closed.
        assertThat(AssetSearchCursor.decode(b64("{\"bogus\":true}"), SearchSortDto.NAME)).isEmpty();
        assertThat(AssetSearchCursor.decode(b64("not json at all"), SearchSortDto.NAME)).isEmpty();
    }

    @Test
    @DisplayName("structurally-invalid decoded cursors fail closed (each decode guard)")
    void structurallyInvalidTokensFailClosed() {
        // an unknown sort value
        assertThat(AssetSearchCursor.decode(b64("{\"s\":\"NOPE\",\"o\":1}"), SearchSortDto.RELEVANCE)).isEmpty();
        // relevance: offset not a number, and a negative offset
        assertThat(AssetSearchCursor.decode(
            b64("{\"s\":\"RELEVANCE\",\"o\":\"x\"}"), SearchSortDto.RELEVANCE)).isEmpty();
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.relevance(SearchSortDto.RELEVANCE, -1).encode(), SearchSortDto.RELEVANCE)).isEmpty();
        // keyset: missing the (k, i) position
        assertThat(AssetSearchCursor.decode(b64("{\"s\":\"NAME\",\"v\":\"x\"}"), SearchSortDto.NAME)).isEmpty();
        // keyset: a non-null cursor missing its sort value
        assertThat(AssetSearchCursor.decode(
            b64("{\"s\":\"NAME\",\"k\":\"DATA_ENTITY\",\"i\":1}"), SearchSortDto.NAME)).isEmpty();
        // keyset: a value that does not parse for the sort's SQL type (tamper guard)
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.keyset(SearchSortDto.STATUS_PRIORITY, "not-a-short", false, "DATA_ENTITY", 1L).encode(),
            SearchSortDto.STATUS_PRIORITY)).isEmpty();
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.keyset(SearchSortDto.UPDATED_AT, "not-a-timestamp", false, "TERM", 1L).encode(),
            SearchSortDto.UPDATED_AT)).isEmpty();
        // keyset: a null-tail (vn) cursor on the NOT-NULL status_priority sort is structurally impossible — it must
        // fail closed, never reach the seek and silently query a different column's NULL tail (R-B4).
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.keyset(SearchSortDto.STATUS_PRIORITY, null, true, "DATA_ENTITY", 1L).encode(),
            SearchSortDto.STATUS_PRIORITY)).isEmpty();

        // ST-10 (#1844) — the same two guards for LAST_VIEWED, whose sort value is a timestamp reached through the
        // recency scope's INNER JOIN. Without the parse guard a tampered value would reach LocalDateTime.parse in
        // the seek and 500; without the NOT-NULL guard a `vn` token would take the nulls-tail path and silently
        // seek a DIFFERENT column's NULL tail, quietly returning the wrong page.
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.keyset(SearchSortDto.LAST_VIEWED, "not-a-timestamp", false, "TERM", 1L).encode(),
            SearchSortDto.LAST_VIEWED)).isEmpty();
        assertThat(AssetSearchCursor.decode(
            AssetSearchCursor.keyset(SearchSortDto.LAST_VIEWED, null, true, "DATA_ENTITY", 1L).encode(),
            SearchSortDto.LAST_VIEWED)).isEmpty();
    }

    private static void roundTripKeyset(final SearchSortDto sort, final String value, final boolean valueNull,
                                        final String kind, final long id) {
        final String token = AssetSearchCursor.keyset(sort, value, valueNull, kind, id).encode();
        assertThat(token).as("encode is non-blank for %s", sort).isNotBlank();
        final Optional<AssetSearchCursor> decoded = AssetSearchCursor.decode(token, sort);
        assertThat(decoded).as("decode round-trips for %s", sort).isPresent();
        final AssetSearchCursor c = decoded.get();
        assertThat(c.sort()).isEqualTo(sort);
        assertThat(c.assetKind()).isEqualTo(kind);
        assertThat(c.assetId()).isEqualTo(id);
        assertThat(c.sortValueNull()).isEqualTo(valueNull);
        assertThat(c.sortValue()).isEqualTo(value);
        assertThat(c.offset()).as("a keyset cursor carries no relevance offset").isZero();
    }

    private static String b64(final String json) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }
}
