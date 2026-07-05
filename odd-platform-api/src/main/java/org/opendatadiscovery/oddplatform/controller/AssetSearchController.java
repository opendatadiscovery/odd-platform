package org.opendatadiscovery.oddplatform.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.AssetSearchApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.service.AssetSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AssetSearchController implements AssetSearchApi {
    private final AssetSearchService assetSearchService;

    @Override
    public Mono<ResponseEntity<AssetList>> searchAssets(final Integer page,
                                                        final Integer size,
                                                        @Valid final Mono<AssetSearchFormData> assetSearchFormData,
                                                        final ServerWebExchange exchange) {
        return assetSearchFormData
            .flatMap(formData -> assetSearchService.searchAssets(formData, page, size))
            .map(ResponseEntity::ok);
    }
}
