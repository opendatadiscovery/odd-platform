package org.opendatadiscovery.oddplatform.dto;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityRange;

/**
 * The resolved popularity narrowing for the unified asset search (ST-9 / #1843, ADR unified-asset-search D5): a closed,
 * inclusive range over the snapshotted {@code popularity_score} — the 15-minute bucketed view-count band on the unified
 * index ({@link PopularityBands}), never the live {@code data_entity.view_count}.
 *
 * <p>Built FAIL-CLOSED from the wire object, mirroring the rail's shipped postures: each bound is clamped into
 * [0, 20] (the per-direction depth precedent — a stale or hand-edited link degrades instead of 400-ing); an absent
 * bound is open; and a wire object with NO bound at all is the same as no range ({@link #of} returns empty), so a
 * {@code popularity: {}} never DE-scopes a search. A range whose min exceeds its max after clamping is
 * {@link #contradictory()} and the repository turns it into a match-nothing predicate — a contradictory filter
 * narrows to nothing, never to everything (the "a scope resolving to nothing narrows to nothing" rule).
 *
 * <p>Carried as its own parameter rather than on {@link FacetStateDto} for the reason favorites is: popularity is not
 * a facet of the legacy {@code /api/search} session (no {@link FacetType}, no aggregated counts there) and rides
 * {@code AssetSearchFormData} — the unified path — only (ADR D9).
 *
 * @param min the lowest score included, 0..20
 * @param max the highest score included, 0..20
 */
public record PopularityRangeDto(short min, short max) {
    /** The narrowing a wire object asks for, or empty when it asks for none (null or no bound set). */
    public static Optional<PopularityRangeDto> of(final PopularityRange wire) {
        if (wire == null || (wire.getMin() == null && wire.getMax() == null)) {
            return Optional.empty();
        }
        final short lo = wire.getMin() == null ? PopularityBands.MIN_SCORE : PopularityBands.clamp(wire.getMin());
        final short hi = wire.getMax() == null ? PopularityBands.MAX_SCORE : PopularityBands.clamp(wire.getMax());
        return Optional.of(new PopularityRangeDto(lo, hi));
    }

    /** True when no score can satisfy the range (min > max) — the predicate must then match nothing. */
    public boolean contradictory() {
        return min > max;
    }
}
