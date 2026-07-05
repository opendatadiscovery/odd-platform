package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The unified cross-kind ranked search over {@code asset_search_entrypoint} (CTRIB-056 / #1838 ST-4, ADR D1).
 * A single GIN-indexed scan matches all three asset kinds; the base tables are joined back only to enforce
 * per-kind eligibility and to source the shared sort/filter columns (ADR D2 — the index carries only what is
 * needed to MATCH). The result is a page of {@code (asset_kind, asset_id)} refs in server-side rank order that
 * the caller resolves into renderable assets via {@link org.opendatadiscovery.oddplatform.service.AssetRefResolver}.
 */
public interface ReactiveAssetSearchRepository {

    /**
     * The ordered page of matching {@code (asset_kind, asset_id)} refs, honoring the query, the asset-kind
     * filter, the entity-class refinement, my-objects owner scope, and the shipped 4-token sort contract.
     *
     * @param state      the mapped facet state (query + sort + the entity-class refinement; the shared facets
     *                   are a follow-up increment — see the extension point in the impl)
     * @param assetKinds the asset-kind filter ({@code AssetKind.getValue()} strings); empty = all kinds
     * @param owner      when non-null, restricts the data-entity rows to this owner's owned set (my-objects)
     */
    Flux<AssetRefDto> rankedPage(FacetStateDto state, List<String> assetKinds, OwnerPojo owner,
                                 int offset, int limit);

    /**
     * The total number of matches for the same predicates as {@link #rankedPage} (paging metadata).
     */
    Mono<Long> count(FacetStateDto state, List<String> assetKinds, OwnerPojo owner);
}
