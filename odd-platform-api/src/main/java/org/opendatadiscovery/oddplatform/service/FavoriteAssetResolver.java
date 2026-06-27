package org.opendatadiscovery.oddplatform.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.FavoriteAsset;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Resolves a page of favorited {@code (asset_kind, asset_id)} pairs into renderable {@link FavoriteAsset} items,
 * preserving the favorited order and inheriting each asset kind's canonical visibility — a deleted asset simply
 * drops out of the result (issue #1815 / ADR D3 "no title denormalization", D4 "order-then-semi-join"). Composes
 * each kind's existing resolver + ref mapper rather than re-querying or caching titles.
 */
@Component
@RequiredArgsConstructor
public class FavoriteAssetResolver {
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final DataEntityMapper dataEntityMapper;
    private final ReactiveTermRepository termRepository;
    private final TermMapper termMapper;
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final QueryExampleMapper queryExampleMapper;

    public Mono<List<FavoriteAsset>> resolve(final List<FavoritePojo> orderedPage) {
        if (orderedPage.isEmpty()) {
            return Mono.just(List.of());
        }
        return Mono.zip(
                resolveDataEntities(idsForKind(orderedPage, AssetKind.DATA_ENTITY)),
                resolveTerms(idsForKind(orderedPage, AssetKind.TERM)),
                resolveQueryExamples(idsForKind(orderedPage, AssetKind.QUERY_EXAMPLE)))
            .map(resolvedByKind -> {
                final Map<String, FavoriteAsset> resolved = new HashMap<>();
                resolved.putAll(resolvedByKind.getT1());
                resolved.putAll(resolvedByKind.getT2());
                resolved.putAll(resolvedByKind.getT3());
                return orderedPage.stream()
                    .map(fav -> resolved.get(key(fav.getAssetKind(), fav.getAssetId())))
                    .filter(Objects::nonNull)
                    .toList();
            });
    }

    private Mono<Map<String, FavoriteAsset>> resolveDataEntities(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return dataEntityRepository.getDimensionsByIds(ids)
            .map(dtos -> dtos.stream()
                .filter(this::isVisible)
                .collect(Collectors.toMap(
                    dto -> key(AssetKind.DATA_ENTITY.getValue(), dto.getDataEntity().getId()),
                    dto -> new FavoriteAsset()
                        .assetKind(AssetKind.DATA_ENTITY)
                        .dataEntity(dataEntityMapper.mapRef(dto)),
                    (existing, ignored) -> existing)));
    }

    private Mono<Map<String, FavoriteAsset>> resolveTerms(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Flux.fromIterable(ids)
            .flatMap(termRepository::getTermRefDto)
            .collectMap(
                dto -> key(AssetKind.TERM.getValue(), dto.getTerm().getId()),
                dto -> new FavoriteAsset()
                    .assetKind(AssetKind.TERM)
                    .term(termMapper.mapToRef(dto)));
    }

    private Mono<Map<String, FavoriteAsset>> resolveQueryExamples(final Set<Long> ids) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Flux.fromIterable(ids)
            .flatMap(queryExampleRepository::get)
            .filter(pojo -> pojo.getDeletedAt() == null)
            .collectMap(
                pojo -> key(AssetKind.QUERY_EXAMPLE.getValue(), pojo.getId()),
                pojo -> new FavoriteAsset()
                    .assetKind(AssetKind.QUERY_EXAMPLE)
                    .queryExample(queryExampleMapper.mapToQueryExampleRef(pojo)));
    }

    private boolean isVisible(final DataEntityDimensionsDto dto) {
        final var dataEntity = dto.getDataEntity();
        return dataEntity.getStatus() != null
            && dataEntity.getStatus().intValue() != DataEntityStatusDto.DELETED.getId()
            && !Boolean.TRUE.equals(dataEntity.getHollow());
    }

    private static Set<Long> idsForKind(final List<FavoritePojo> page, final AssetKind kind) {
        return page.stream()
            .filter(fav -> kind.getValue().equals(fav.getAssetKind()))
            .map(FavoritePojo::getAssetId)
            .collect(Collectors.toSet());
    }

    private static String key(final String assetKind, final Long assetId) {
        return assetKind + ":" + assetId;
    }
}
