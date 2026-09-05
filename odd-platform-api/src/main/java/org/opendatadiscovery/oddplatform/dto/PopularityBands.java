package org.opendatadiscovery.oddplatform.dto;

/**
 * The 21 popularity bands of the unified asset search (ST-9 / #1843, ADR unified-asset-search D5) — the exact
 * view-count boundaries of each snapshotted {@code popularity_score}. The score is the log2 band the migration's
 * {@code asset_popularity_bucket(view_count) = least(20, floor(log2(view_count + 1)))} assigns, so band {@code s}
 * covers the view counts {@code [2^s - 1, 2^(s+1) - 2]}: 0 → 0 views, 1 → 1–2, 2 → 3–6, 3 → 7–14, 4 → 15–30,
 * 5 → 31–62, … 20 → 1,048,575 and above (open).
 *
 * <p>This class is the ONE place the served boundaries are derived, so every label a user reads (the slider stops,
 * the chip, the assistive text) names exactly the boundary the range predicate applies. It is pinned against the
 * SQL function at every boundary by {@code AssetSearchPopularityIntegrationTest} — the SQL computes the band with a
 * floating-point {@code ln(v+1)/ln(2)}, so the agreement is measured, not assumed.
 */
public final class PopularityBands {
    /** The top band; a score is always clamped into [0, MAX_SCORE]. */
    public static final short MAX_SCORE = 20;
    public static final short MIN_SCORE = 0;

    private PopularityBands() {
    }

    /** The lowest view count in band {@code score}: {@code 2^score - 1}. */
    public static long minViews(final int score) {
        return (1L << score) - 1;
    }

    /** The highest view count in band {@code score}: {@code 2^(score+1) - 2}; {@code null} on the open top band. */
    public static Long maxViews(final int score) {
        return score >= MAX_SCORE ? null : (1L << (score + 1)) - 2;
    }

    /** Clamp a requested score into [0, MAX_SCORE] — a stale or hand-edited value degrades instead of failing. */
    public static short clamp(final int score) {
        return (short) Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
    }
}
