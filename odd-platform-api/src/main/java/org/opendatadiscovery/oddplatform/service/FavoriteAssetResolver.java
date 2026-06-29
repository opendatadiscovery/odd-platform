package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.FavoriteAsset;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Resolves a page of favorited {@code (asset_kind, asset_id)} pairs into renderable {@link FavoriteAsset}
 * items, preserving the favorited order and inheriting each kind's visibility — a deleted asset drops out
 * (issue #1815 / ADR D3, D4). The polymorphic resolution is shared with Recently-Viewed via
 * {@link AssetRefResolver}; this adapter only maps the resolved refs into the favorites contract type and
 * re-applies the favorited order.
 */
@Component
@RequiredArgsConstructor
public class FavoriteAssetResolver {
    private final AssetRefResolver assetRefResolver;

    public Mono<List<FavoriteAsset>> resolve(final List<FavoritePojo> orderedPage) {
        if (orderedPage.isEmpty()) {
            return Mono.just(List.of());
        }
        final List<AssetRefDto> refs = orderedPage.stream()
            .map(fav -> new AssetRefDto(fav.getAssetKind(), fav.getAssetId()))
            .toList();
        return assetRefResolver.resolveByKey(refs)
            .map(resolved -> orderedPage.stream()
                .map(fav -> resolved.get(AssetRefResolver.key(fav.getAssetKind(), fav.getAssetId())))
                .filter(Objects::nonNull)
                .map(r -> new FavoriteAsset()
                    .assetKind(r.assetKind())
                    .dataEntity(r.dataEntity())
                    .term(r.term())
                    .queryExample(r.queryExample()))
                .toList());
    }
}
