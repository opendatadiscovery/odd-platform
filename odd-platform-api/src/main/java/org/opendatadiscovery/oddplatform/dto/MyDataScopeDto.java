package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;

/**
 * The My-data scope tokens (ST-8 / #1842, ADR unified-asset-search D4). The wire type is a plain string array,
 * not an enum, so that an unrecognised token DEGRADES (is dropped) instead of failing the request — a shareable
 * search URL must never 400 because it is stale or hand-edited. {@link #parse(Collection)} is that degradation.
 *
 * <p>{@code MY_OBJECTS} is the caller's owned set; {@code UPSTREAM} / {@code DOWNSTREAM} are its depth-bounded
 * lineage neighbours, excluding the owned anchors themselves — the same semantics the catalog-overview panels
 * already ship ({@code DataEntityRelationsServiceImpl#getDependentDataEntityOddrns}).
 */
public enum MyDataScopeDto {
    MY_OBJECTS(null),
    UPSTREAM(LineageStreamKind.UPSTREAM),
    DOWNSTREAM(LineageStreamKind.DOWNSTREAM);

    private final LineageStreamKind streamKind;

    MyDataScopeDto(final LineageStreamKind streamKind) {
        this.streamKind = streamKind;
    }

    /**
     * The lineage direction this scope walks, or empty for {@link #MY_OBJECTS}, which walks nothing.
     */
    public Optional<LineageStreamKind> streamKind() {
        return Optional.ofNullable(streamKind);
    }

    /**
     * Fail-closed parse of the wire tokens: case-insensitive, order-preserving, duplicates collapsed, and every
     * unrecognised or blank token silently DROPPED. A null / empty input yields an empty set, which means
     * "no scope narrowing" (the All state) — never "everything is selected".
     */
    public static Set<MyDataScopeDto> parse(final Collection<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return Set.of();
        }
        final Set<MyDataScopeDto> parsed = new LinkedHashSet<>();
        for (final String token : tokens) {
            if (token == null || token.isBlank()) {
                continue;
            }
            final String normalised = token.trim().toUpperCase();
            Arrays.stream(values())
                .filter(scope -> scope.name().equals(normalised))
                .findFirst()
                .ifPresent(parsed::add);
        }
        return parsed;
    }

    /**
     * The back-compat alias (ADR D9): when {@code my_data} is absent, a legacy {@code my_objects: true} is read
     * as {@code [MY_OBJECTS]}, so existing saved searches and bookmarked {@code ?my=true} URLs keep working.
     * When {@code my_data} is present it wins outright and {@code my_objects} is ignored.
     */
    public static Set<MyDataScopeDto> resolve(final List<String> myData, final Boolean legacyMyObjects) {
        final Set<MyDataScopeDto> scopes = parse(myData);
        if (!scopes.isEmpty()) {
            return scopes;
        }
        return Boolean.TRUE.equals(legacyMyObjects) ? Set.of(MY_OBJECTS) : Set.of();
    }
}
