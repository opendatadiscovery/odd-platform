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
    NAME;

    public static Optional<SearchSortDto> fromString(final String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(sort -> sort.name().equalsIgnoreCase(value.trim()))
            .findFirst();
    }
}
