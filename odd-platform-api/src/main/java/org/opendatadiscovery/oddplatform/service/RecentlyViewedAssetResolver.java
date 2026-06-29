package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAsset;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Resolves a page of recently-viewed {@code (asset_kind, asset_id)} pairs into renderable
 * {@link RecentlyViewedAsset} items, preserving the most-recent-first order and attaching each row's
 * {@code last_viewed_at} (issue #1816 / ADR D3, D4). The polymorphic resolution is shared with Favorites via
 * {@link AssetRefResolver}; this adapter maps the resolved refs into the recently-viewed contract type and
 * re-applies the recency order.
 */
@Component
@RequiredArgsConstructor
public class RecentlyViewedAssetResolver {
    private final AssetRefResolver assetRefResolver;

    public Mono<List<RecentlyViewedAsset>> resolve(final List<RecentlyViewedPojo> orderedPage) {
        if (orderedPage.isEmpty()) {
            return Mono.just(List.of());
        }
        final List<AssetRefDto> refs = orderedPage.stream()
            .map(rv -> new AssetRefDto(rv.getAssetKind(), rv.getAssetId()))
            .toList();
        return assetRefResolver.resolveByKey(refs)
            .map(resolved -> orderedPage.stream()
                .map(rv -> {
                    final AssetRefResolver.ResolvedAsset r =
                        resolved.get(AssetRefResolver.key(rv.getAssetKind(), rv.getAssetId()));
                    if (r == null) {
                        return null;
                    }
                    return new RecentlyViewedAsset()
                        .assetKind(r.assetKind())
                        .dataEntity(r.dataEntity())
                        .term(r.term())
                        .queryExample(r.queryExample())
                        .lastViewedAt(DateTimeUtil.mapUTCDateTime(rv.getLastViewedAt()));
                })
                .filter(Objects::nonNull)
                .toList());
    }
}
