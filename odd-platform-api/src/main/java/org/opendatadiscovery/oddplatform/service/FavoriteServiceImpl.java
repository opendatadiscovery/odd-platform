package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveFavoriteRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {
    private final CurrentUserIdentityResolver currentUserIdentityResolver;
    private final ReactiveFavoriteRepository favoriteRepository;

    @Override
    public Mono<Void> addFavorite(final AssetKind assetKind, final long assetId) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> favoriteRepository.markFavorite(
                user.username(), user.provider(), assetKind.getValue(), assetId));
    }

    @Override
    public Mono<Void> removeFavorite(final AssetKind assetKind, final long assetId) {
        return currentUserIdentityResolver.resolve()
            .flatMap(user -> favoriteRepository.unmarkFavorite(
                user.username(), user.provider(), assetKind.getValue(), assetId));
    }

    @Override
    public Flux<AssetRef> getFavoriteStatus(final Flux<AssetRef> assetRefs) {
        return assetRefs.collectList().flatMapMany(refs -> {
            if (refs.isEmpty()) {
                return Flux.empty();
            }
            final List<AssetRefDto> queried = refs.stream()
                .map(ref -> new AssetRefDto(ref.getAssetKind().getValue(), ref.getAssetId()))
                .toList();
            return currentUserIdentityResolver.resolve()
                .flatMapMany(user -> favoriteRepository.getFavorited(user.username(), user.provider(), queried))
                .map(pojo -> new AssetRef(AssetKind.fromValue(pojo.getAssetKind()), pojo.getAssetId()));
        });
    }
}
