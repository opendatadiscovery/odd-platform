package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;

/**
 * The resolved My-data lineage scope (ST-8 / #1842): the data-entity ids reachable from the caller's owned set
 * within the requested per-direction depth, plus whether the walk was cut short.
 *
 * <p><b>The owned set itself is deliberately NOT in here.</b> {@code MY_OBJECTS} stays an uncapped SQL semi-join
 * in the ranked query (exactly as the shipped {@code my_objects} predicate is today), so an owner of tens of
 * thousands of assets never loses rows to this walk's budget — only the lineage expansion is bounded.
 *
 * @param neighbourDataEntityIds ids reachable by lineage, excluding the owned anchors; empty when no lineage
 *                               scope was selected or nothing was reachable
 * @param truncated              true when a bound cut the walk short, so this set is a SUBSET of the true scope
 * @param truncationReason       {@code NODE_CAP} (a deterministic prefix — the same request re-runs identically)
 *                               or {@code TIMEOUT} (no scope resolved; the caller must narrow), null when not truncated
 */
public record MyDataScopeResult(Set<Long> neighbourDataEntityIds, boolean truncated, String truncationReason) {
    public static final String REASON_NODE_CAP = "NODE_CAP";
    public static final String REASON_TIMEOUT = "TIMEOUT";

    public static MyDataScopeResult empty() {
        return new MyDataScopeResult(Set.of(), false, null);
    }

    public static MyDataScopeResult of(final Set<Long> ids) {
        return new MyDataScopeResult(ids, false, null);
    }

    public static MyDataScopeResult truncated(final Set<Long> ids, final String reason) {
        return new MyDataScopeResult(ids, true, reason);
    }
}
