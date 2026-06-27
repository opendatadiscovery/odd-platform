package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.FavoriteAssetList;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FavoriteService {

    Mono<Void> addFavorite(AssetKind assetKind, long assetId);

    Mono<Void> removeFavorite(AssetKind assetKind, long assetId);

    Flux<AssetRef> getFavoriteStatus(Flux<AssetRef> assetRefs);

    Mono<FavoriteAssetList> getFavoritesList(List<AssetKind> assetTypes, int page, int size);
}
