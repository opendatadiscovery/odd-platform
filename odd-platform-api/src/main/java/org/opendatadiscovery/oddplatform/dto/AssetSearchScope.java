package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;

/**
 * The resolved My-data narrowing handed to the ranked cross-kind query (ST-8 / #1842).
 *
 * <p>It carries the owner id rather than a pre-computed owned set on purpose: {@code MY_OBJECTS} is applied as
 * an UNCAPPED SQL semi-join inside the search query — the same shape the shipped {@code my_objects} predicate
 * already uses — so a caller who owns tens of thousands of assets never loses rows. Only the lineage half is
 * materialised, and only because it had to be budgeted.
 *
 * <p>{@code lineageSelected} is deliberately distinct from "{@code lineageDataEntityIds} is non-empty": a
 * selected Upstream/Downstream scope that resolves to nothing must narrow the result to NOTHING, not fall
 * through to the unscoped catalog.
 *
 * @param ownerId              the authenticated caller's owner, resolved server-side (never from the request)
 * @param myObjects            whether the MY_OBJECTS scope is selected
 * @param lineageSelected      whether any lineage scope is selected
 * @param lineageDataEntityIds the resolved lineage neighbours; may be empty even when lineageSelected is true
 */
public record AssetSearchScope(long ownerId,
                               boolean myObjects,
                               boolean lineageSelected,
                               Set<Long> lineageDataEntityIds) {
    /** True when any My-data scope is selected, i.e. when the search must be narrowed at all. */
    public boolean active() {
        return myObjects || lineageSelected;
    }
}
