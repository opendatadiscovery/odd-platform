package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import reactor.core.publisher.Mono;

public interface AssetSearchService {

    Mono<AssetList> searchAssets(AssetSearchFormData formData, int page, int size);
}
