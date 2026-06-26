package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.FavoriteApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class FavoriteController implements FavoriteApi {
    private final FavoriteService favoriteService;

    @Override
    public Mono<ResponseEntity<Void>> addFavorite(final AssetKind assetKind, final Long assetId,
                                                  final ServerWebExchange exchange) {
        return favoriteService.addFavorite(assetKind, assetId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Void>> removeFavorite(final AssetKind assetKind, final Long assetId,
                                                     final ServerWebExchange exchange) {
        return favoriteService.removeFavorite(assetKind, assetId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Flux<AssetRef>>> getFavoriteStatus(final Flux<AssetRef> assetRef,
                                                                  final ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(favoriteService.getFavoriteStatus(assetRef)));
    }
}
