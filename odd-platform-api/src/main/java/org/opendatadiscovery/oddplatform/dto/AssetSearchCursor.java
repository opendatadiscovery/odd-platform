package org.opendatadiscovery.oddplatform.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

/**
 * An opaque, forward-only pagination cursor for the unified cross-kind asset search (ST-5b / #1839).
 *
 * <p>Two shapes, one token. For the index-backed browse sorts (status-priority / updated_at / name) it carries
 * the KEYSET position of the last row returned — {@code (sortValue | sortValueNull, assetKind, assetId)} — so the
 * next page is an indexed seek past it (deep pages stay index-fast + stable under concurrent writes). For the
 * non-seekable relevance sort ({@code ts_rank}) it carries the OFFSET reached, which the service bounds by a
 * depth cap (ADR unified-asset-search D12). The keyset-vs-offset split is entirely internal — the client only
 * ever echoes the opaque {@code nextCursor} back.
 *
 * <p>The cursor is SORT-SCOPED and FAILS CLOSED: {@link #decode} returns empty (→ the first page) for an absent,
 * malformed, tampered, or foreign-sort token, so a bad cursor never raises and is never mis-applied to a
 * different sort's seek (ADR D10 / the IT-003 fail-closed posture). It carries only non-sensitive catalog
 * position data — no secrets.
 */
public final class AssetSearchCursor {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final SearchSortDto sort;
    private final Integer offset;         // RELEVANCE only
    private final String sortValue;       // keyset only; null when sortValueNull, or for relevance
    private final boolean sortValueNull;  // keyset only — the nulls-last tail
    private final String assetKind;       // keyset only
    private final Long assetId;           // keyset only

    private AssetSearchCursor(final SearchSortDto sort, final Integer offset, final String sortValue,
                              final boolean sortValueNull, final String assetKind, final Long assetId) {
        this.sort = sort;
        this.offset = offset;
        this.sortValue = sortValue;
        this.sortValueNull = sortValueNull;
        this.assetKind = assetKind;
        this.assetId = assetId;
    }

    /** A relevance (offset-paged) cursor. */
    public static AssetSearchCursor relevance(final SearchSortDto sort, final int offset) {
        return new AssetSearchCursor(sort, offset, null, false, null, null);
    }

    /** A keyset (seek-paged) cursor at the last row of a page. */
    public static AssetSearchCursor keyset(final SearchSortDto sort, final String sortValue,
                                           final boolean sortValueNull, final String assetKind, final long assetId) {
        return new AssetSearchCursor(sort, null, sortValue, sortValueNull, assetKind, assetId);
    }

    public SearchSortDto sort() {
        return sort;
    }

    public int offset() {
        return offset == null ? 0 : offset;
    }

    public String sortValue() {
        return sortValue;
    }

    public boolean sortValueNull() {
        return sortValueNull;
    }

    public String assetKind() {
        return assetKind;
    }

    public long assetId() {
        return assetId == null ? 0L : assetId;
    }

    /** Encode to an opaque base64url token (no padding). */
    public String encode() {
        final ObjectNode node = MAPPER.createObjectNode();
        node.put("s", sort.name());
        if (sort == SearchSortDto.RELEVANCE) {
            node.put("o", offset());
        } else {
            node.put("k", assetKind);
            node.put("i", assetId());
            if (sortValueNull) {
                node.put("vn", true);
            } else {
                node.put("v", sortValue);
            }
        }
        // node.toString() renders the JSON with no checked exception (unlike writeValueAsBytes) — the token is
        // built from our own trusted, JSON-trivial fields, so there is no failure path to handle.
        return Base64.getUrlEncoder().withoutPadding()
            .encodeToString(node.toString().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Decode a token, scoped to {@code expectedSort}. Fails closed (→ empty, i.e. the first page) on any absent,
     * malformed, tampered, or foreign-sort token — never raises. The caller treats empty as "start from page 1".
     */
    public static Optional<AssetSearchCursor> decode(final String token, final SearchSortDto expectedSort) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            final byte[] json = Base64.getUrlDecoder().decode(token.trim());
            final Map<?, ?> m = MAPPER.readValue(json, Map.class);
            final SearchSortDto sort = SearchSortDto.fromString(String.valueOf(m.get("s"))).orElse(null);
            if (sort == null || sort != expectedSort) {
                // sort-scoped: a cursor minted for another sort (or an unknown sort) is not applied here.
                return Optional.empty();
            }
            if (sort == SearchSortDto.RELEVANCE) {
                if (!(m.get("o") instanceof Number offset) || offset.intValue() < 0) {
                    return Optional.empty();
                }
                return Optional.of(relevance(sort, offset.intValue()));
            }
            if (!(m.get("k") instanceof String kind) || !(m.get("i") instanceof Number id)) {
                return Optional.empty();
            }
            final boolean valueNull = Boolean.TRUE.equals(m.get("vn"));
            if (valueNull && (sort == SearchSortDto.STATUS_PRIORITY || sort == SearchSortDto.POPULARITY)) {
                // status_priority and popularity_score are NOT NULL — a null-tail (vn) cursor is structurally
                // impossible for them, so a tampered one must fail closed here rather than reach the seek and
                // silently query a different column's NULL tail (R-B4 fail-closed; the null tail is a
                // nullable-sort-only concept). POPULARITY joined this guard with ST-9 (#1843).
                return Optional.empty();
            }
            final String value = valueNull ? null : (m.get("v") == null ? null : String.valueOf(m.get("v")));
            if (!valueNull) {
                if (value == null || !parsesForSort(expectedSort, value)) {
                    // a non-null keyset cursor must carry a value that parses for its sort (fail closed on tamper).
                    return Optional.empty();
                }
            }
            return Optional.of(keyset(sort, value, valueNull, kind, id.longValue()));
        } catch (final Exception e) {
            return Optional.empty();
        }
    }

    // Validate the encoded sort value round-trips to the sort's SQL type, so a decoded cursor is always bindable.
    private static boolean parsesForSort(final SearchSortDto sort, final String value) {
        try {
            switch (sort) {
                case STATUS_PRIORITY, POPULARITY -> Short.parseShort(value); // both NOT NULL smallint columns
                case UPDATED_AT -> LocalDateTime.parse(value);
                default -> {
                    // NAME: any string is a valid sort value.
                }
            }
            return true;
        } catch (final Exception e) {
            return false;
        }
    }
}
