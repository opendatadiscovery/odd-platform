package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import reactor.core.publisher.Mono;

public interface AssetSearchService {

    /**
     * A keyset-paginated page of the unified cross-kind search (ST-5b). {@code cursor} is the opaque forward-only
     * token from the previous page's {@code page_info.nextCursor} (absent / null = the first page); it is decoded
     * fail-closed, so a malformed or foreign cursor simply starts from the first page.
     */
    Mono<AssetList> searchAssets(AssetSearchFormData formData, Integer size, String cursor);
}
