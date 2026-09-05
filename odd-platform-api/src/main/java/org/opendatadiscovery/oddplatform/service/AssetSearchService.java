package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityFacet;
import reactor.core.publisher.Mono;

public interface AssetSearchService {

    /**
     * A keyset-paginated page of the unified cross-kind search (ST-5b). {@code cursor} is the opaque forward-only
     * token from the previous page's {@code page_info.nextCursor} (absent / null = the first page); it is decoded
     * fail-closed, so a malformed or foreign cursor simply starts from the first page.
     */
    Mono<AssetList> searchAssets(AssetSearchFormData formData, Integer size, String cursor);

    /**
     * The popularity distribution behind the Popularity range facet (ST-9 / #1843): the 21 bands (scores 0..20) with
     * their exact view-count boundaries and, per band, how many DATA ENTITIES match every other condition of the same
     * request — the request's own {@code popularity} range is ignored (exclude-own-facet). The My-data and favorites
     * scopes resolve exactly as they do for {@link #searchAssets}; a scope with no resolvable owner yields 21 zeros.
     */
    Mono<PopularityFacet> popularityFacet(AssetSearchFormData formData);
}
