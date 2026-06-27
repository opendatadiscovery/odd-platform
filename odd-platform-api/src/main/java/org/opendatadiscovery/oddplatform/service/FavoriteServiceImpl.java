package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.FavoriteAssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveFavoriteRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {
    private static final int MAX_PAGE_SIZE = 100;

    private final CurrentUserIdentityResolver currentUserIdentityResolver;
    private final ReactiveFavoriteRepository favoriteRepository;
    private final FavoriteAssetResolver favoriteAssetResolver;

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

    @Override
    public Mono<FavoriteAssetList> getFavoritesList(final List<AssetKind> assetTypes,
                                                    final int page, final int size) {
        final int safePage = Math.max(page, 1);
        final int cappedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        final List<String> assetKinds = assetTypes == null ? List.of()
            : assetTypes.stream().map(AssetKind::getValue).toList();
        return currentUserIdentityResolver.resolve().flatMap(user -> Mono.zip(
                favoriteRepository.getFavoritedPage(user.username(), user.provider(), assetKinds,
                    (safePage - 1) * cappedSize, cappedSize).collectList(),
                favoriteRepository.countFavorites(user.username(), user.provider(), assetKinds))
            .flatMap(pageAndCount -> favoriteAssetResolver.resolve(pageAndCount.getT1())
                .map(items -> new FavoriteAssetList()
                    .items(items)
                    .pageInfo(new PageInfo()
                        .total(pageAndCount.getT2())
                        .hasNext((long) safePage * cappedSize < pageAndCount.getT2())))));
    }
}
