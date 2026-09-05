package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.AssetSearchApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityFacet;
import org.opendatadiscovery.oddplatform.service.AssetSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AssetSearchController implements AssetSearchApi {
    private final AssetSearchService assetSearchService;

    // NB: this override declares ZERO parameter constraints. The generated AssetSearchApi interface owns the
    // constraint configuration (@NotNull @Valid on size, @Valid @RequestBody on the form data, @Valid on the
    // optional cursor). A method override that redefines a PARTIAL parameter-constraint set violates Bean
    // Validation (HV000151) and 500s every request — mirror SavedSearchController#getSavedSearchList: implement
    // with plain params, let the interface's @Valid @RequestBody drive body validation. The param ORDER matches
    // the generated interface exactly (size, body, cursor, exchange — required params + body before the optional
    // cursor). cursor is the opaque forward-only pagination token (null/empty = first page; ST-5b).
    @Override
    public Mono<ResponseEntity<AssetList>> searchAssets(final Integer size,
                                                        final Mono<AssetSearchFormData> assetSearchFormData,
                                                        final String cursor,
                                                        final ServerWebExchange exchange) {
        return assetSearchFormData
            .flatMap(formData -> assetSearchService.searchAssets(formData, size, cursor))
            .map(ResponseEntity::ok);
    }

    // ST-9 (#1843) — the Popularity facet's distribution. Same zero-parameter-constraint rule as above (the generated
    // interface owns @Valid @RequestBody on the body); the param ORDER matches the generated method exactly.
    @Override
    public Mono<ResponseEntity<PopularityFacet>> getAssetSearchPopularityFacet(
        final Mono<AssetSearchFormData> assetSearchFormData,
        final ServerWebExchange exchange) {
        return assetSearchFormData
            .flatMap(assetSearchService::popularityFacet)
            .map(ResponseEntity::ok);
    }
}
