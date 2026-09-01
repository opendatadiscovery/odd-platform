package org.opendatadiscovery.oddplatform.service;

import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
import reactor.core.publisher.Mono;

/**
 * Resolves the LINEAGE half of the My-data scope filter (ST-8 / #1842, ADR unified-asset-search D4): the data
 * entities reachable upstream / downstream of the caller's owned set, within a per-direction depth.
 *
 * <p><b>{@code MY_OBJECTS} is deliberately not resolved here.</b> It stays an uncapped SQL semi-join inside the
 * ranked search query, exactly as the shipped {@code my_objects} predicate is today, so an owner of tens of
 * thousands of assets never loses rows to this walk's budget. Only the lineage expansion is bounded — which is
 * the part that can explode.
 */
public interface MyDataScopeResolver {

    /**
     * @param ownerId         the resolved owner of the authenticated caller (never taken from the request)
     * @param scopes          the selected scopes; only UPSTREAM / DOWNSTREAM cause any work here
     * @param upstreamDepth   hops to walk upstream, already clamped by the caller
     * @param downstreamDepth hops to walk downstream, already clamped by the caller
     * @return the reachable data-entity ids (excluding the owned anchors) plus the truncation state; an empty,
     *         untruncated result when no lineage scope is selected
     */
    Mono<MyDataScopeResult> resolve(long ownerId,
                                    Set<MyDataScopeDto> scopes,
                                    int upstreamDepth,
                                    int downstreamDepth);
}
