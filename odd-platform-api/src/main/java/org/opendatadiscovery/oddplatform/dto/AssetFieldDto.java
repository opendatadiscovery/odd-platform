package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The server-resolved result columns a cross-kind search request may name in {@code AssetSearchFormData.columns}
 * (CTRIB-073 / #1847 ST-13a, ADR unified-asset-search D7): the allow-list behind the per-row {@code Asset.fields}
 * projection. The token is the column id the UI's field catalog uses, lower-case on the wire.
 *
 * <p>Resolution is fail-closed the way {@code sort} and {@code my_data} are: {@link #fromTokens} keeps the tokens it
 * knows and silently DROPS the rest — an unknown id, a client-only column ({@code type}, {@code status},
 * {@code query}: the ref already carries those), one of the two fixed columns, a duplicate, a hand-edited URL, or a
 * saved search from an older release all degrade to "project what you can" instead of a 4xx. Absent / empty ⇒ an
 * empty set ⇒ no {@code fields} object on any item and a payload byte-identical to the pre-ST-13a one (D9).
 */
public enum AssetFieldDto {
    NAMESPACE("namespace"),
    OWNERS("owners"),
    UPDATED_AT("updated_at"),
    CREATED_AT("created_at"),
    LAST_INGESTED_AT("last_ingested_at"),
    DATASOURCE("datasource"),
    GROUPS("groups"),
    TAGS("tags"),
    DESCRIPTION("description"),
    POPULARITY("popularity"),
    ROWS_COUNT("rows_count"),
    FIELDS_COUNT("fields_count"),
    SUITE_URL("suite_url"),
    SOURCES("sources"),
    TARGETS("targets"),
    INPUTS("inputs"),
    OUTPUTS("outputs"),
    CONSUMERS_COUNT("consumers_count"),
    ENTITIES_COUNT("entities_count");

    private static final Map<String, AssetFieldDto> BY_TOKEN = Stream.of(values())
        .collect(Collectors.toUnmodifiableMap(AssetFieldDto::token, Function.identity()));

    private final String token;

    AssetFieldDto(final String token) {
        this.token = token;
    }

    public String token() {
        return token;
    }

    /**
     * The known tokens of {@code columns}, as a set; unknown / blank / null entries are dropped, never rejected.
     * A {@code null} or empty list yields the empty set.
     */
    public static Set<AssetFieldDto> fromTokens(final Collection<String> tokens) {
        final Set<AssetFieldDto> fields = EnumSet.noneOf(AssetFieldDto.class);
        if (tokens == null) {
            return fields;
        }
        for (final String token : tokens) {
            if (token == null || token.isBlank()) {
                continue;
            }
            final AssetFieldDto field = BY_TOKEN.get(token.trim().toLowerCase(Locale.ROOT));
            if (field != null) {
                fields.add(field);
            }
        }
        return fields;
    }
}
