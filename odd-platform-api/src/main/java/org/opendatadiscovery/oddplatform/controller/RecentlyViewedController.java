package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.RecentlyViewedApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedRef;
import org.opendatadiscovery.oddplatform.service.RecentlyViewedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class RecentlyViewedController implements RecentlyViewedApi {
    private final RecentlyViewedService recentlyViewedService;

    @Override
    public Mono<ResponseEntity<Void>> recordRecentlyViewed(final AssetKind assetKind, final Long assetId,
                                                           final ServerWebExchange exchange) {
        return recentlyViewedService.recordView(assetKind, assetId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Void>> removeRecentlyViewed(final AssetKind assetKind, final Long assetId,
                                                          final ServerWebExchange exchange) {
        return recentlyViewedService.removeRecentlyViewed(assetKind, assetId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Flux<RecentlyViewedRef>>> getRecentlyViewedStatus(final Flux<AssetRef> assetRef,
                                                                                 final ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(recentlyViewedService.getRecentlyViewedStatus(assetRef)));
    }

    @Override
    public Mono<ResponseEntity<RecentlyViewedAssetList>> getRecentlyViewedList(final Integer page,
                                                                              final Integer size,
                                                                              final List<AssetKind> assetTypes,
                                                                              final OffsetDateTime viewedAfter,
                                                                              final OffsetDateTime viewedBefore,
                                                                              final ServerWebExchange exchange) {
        return recentlyViewedService.getRecentlyViewedList(assetTypes, viewedAfter, viewedBefore, page, size)
            .map(ResponseEntity::ok);
    }
}
